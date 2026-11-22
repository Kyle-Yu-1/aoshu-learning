/* 通过 GitHub API 分段上传未推送的 commit（应对 github.com 大流量被卡） */
const {execSync} = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = 'C:/Users/19461/OneDrive/文档/ChatGPT/Business/aoshu-learning';
const API = 'https://api.github.com';
const REPO = 'Kyle-Yu-1/aoshu-learning';
const GH = 'C:/Users/19461/AppData/Local/gh-cli/bin/gh.exe';

function git(args){ return execSync('git -C "'+ROOT+'" '+args,{encoding:'utf8'}).trim(); }
function api(method, url, body){
  const opts = { method, headers: {
    'Authorization': 'token ' + TOKEN,
    'User-Agent': 'aoshu-learning-deploy',
    'Accept': 'application/vnd.github+json'
  }};
  if(body){ opts.headers['Content-Type']='application/json'; opts.body = JSON.stringify(body); }
  return fetch(API + url, opts).then(async r => {
    const t = await r.text();
    if(!r.ok) throw new Error(method + ' ' + url + ' -> ' + r.status + ' ' + t.slice(0,200));
    return t ? JSON.parse(t) : null;
  });
}

(async () => {
  const TOKEN = execSync('"'+GH+'" auth token',{encoding:'utf8'}).trim();
  global.TOKEN = TOKEN;
  const head = git('rev-parse HEAD');
  const localParent = git('log -1 --format=%P').split(' ')[0];
  console.log('head:', head, 'localParent:', localParent);
  // 远程当前 main 作为 API 提交的父对象
  const remoteRef = await api('GET', '/repos/'+REPO+'/git/refs/heads/main');
  const remoteParent = remoteRef.object.sha;
  const remoteCommit = await api('GET', '/repos/'+REPO+'/git/commits/' + remoteParent);
  const baseTree = remoteCommit.tree.sha;
  console.log('remoteParent:', remoteParent, 'baseTree:', baseTree);
  const parts = git('-c core.quotepath=false diff --name-status -z ' + localParent + ' HEAD').split('\0').filter(Boolean);
  const entries = [];
  for(let i=0;i<parts.length;){
    const st = parts[i];
    if(st[0]==='R' || st[0]==='C'){ entries.push({st, file: parts[i+2]}); i += 3; }
    else { entries.push({st, file: parts[i+1]}); i += 2; }
  }
  console.log('changed files:', entries.length);
  const treeItems = [];
  for(const e of entries){
    const st = e.st, file = e.file;
    if(st === 'D'){ console.log('deleted (skip in API flow):', file); continue; }
    const content = fs.readFileSync(path.join(ROOT, file));
    const b = await api('POST', '/repos/'+REPO+'/git/blobs', { content: content.toString('base64'), encoding: 'base64' });
    treeItems.push({ path: file, mode: '100644', type: 'blob', sha: b.sha });
    console.log('blob ok:', file, b.sha.slice(0,8));
  }
  const t = await api('POST', '/repos/'+REPO+'/git/trees', { base_tree: baseTree, tree: treeItems });
  console.log('tree:', t.sha);
  const c = await api('POST', '/repos/'+REPO+'/git/commits', {
    message: git('log -1 --format=%s'),
    tree: t.sha,
    parents: [remoteParent]
  });
  console.log('commit:', c.sha);
  await api('PATCH', '/repos/'+REPO+'/git/refs/heads/main', { sha: c.sha, force: false });
  console.log('REF UPDATED ->', c.sha);
  const ref = await api('GET', '/repos/'+REPO+'/git/refs/heads/main');
  console.log('remote main now:', ref.object.sha);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });