(function () {

  const CSS = `
    #terminal-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.06);        
      z-index: 9999;
      align-items: center;
      justify-content: center;
      font-family: monospace;       
    }
    #terminal-overlay.active { display: flex; }

    #terminal-box {
      width: 900px;                  
      height: 600px;                        
      min-width: 400px;
      min-height: 200px;
      max-height: 95vh;
      max-width: 96vw;
      resize: both;
      background: rgba(22, 25, 26, 0.46);                
      border: 1px solid rgba(174, 8, 230, 0.25); 
      border-radius: 6px;                
      display: flex;
      flex-direction: column;
      overflow: auto;              
    }

    #terminal-titlebar {
      background: rgba(51, 6, 86, 0.45);               
      border-bottom: 1px solid rgba(185, 77, 244, 0.2);
      padding: 7px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;               
      color: #bdaaee;                      
      user-select: none;
      flex-shrink: 0;                    
    }

    #terminal-output {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      font-size: 14px;          
      color: #ca99d4;                    
      line-height: 1.6;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 204, 255, 0) transparent;
      min-height: 0;                      
    }

    .line-cmd  { color: #bdaaee; }     
    .line-out  { color: #bdaaee; white-space: pre-wrap; } 
    .line-err  { color: #d04c9fe9; }         
    .line-info { color: #4ba678; }        
    .line-dim  { color: rgba(158, 193, 222, 0.5); } 
    .line-ascii{ color: #bb92e2; white-space: pre; font-size: 15px; line-height: 1.3; } 

    #terminal-inputrow {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-top: 1px solid rgba(92, 1, 183, 0.12);
      background: rgba(3, 11, 17, 0);             
      gap: 8px;
      flex-shrink: 0;                      
    }
    #prompt-label {
      color: #bdaaee;               
      font-size: 13px;
      white-space: nowrap;
    }
    #terminal-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #bdaaee;                   
      font-family: monospace;
      font-size: 13px;
      caret-color: #bdaaee;              
    }
  `;

  const ASCII_LOGO = String.raw`

███████╗███████╗██████╗  ██████╗  ██████╗ ███████╗
╚══███╔╝██╔════╝██╔══██╗██╔═══██╗██╔════╝ ██╔════╝
  ███╔╝ █████╗  ██████╔╝██║   ██║██║  ███╗███████╗
 ███╔╝  ██╔══╝  ██╔══██╗██║   ██║██║   ██║╚════██║
███████╗███████╗██║  ██║╚██████╔╝╚██████╔╝███████║
╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝

    [ zerog5.tech ]  
    * astrophysics . cybersecurity . linux *
`;

  const sessionLog = [];
  function logCmd(cmd) {
    const now = new Date();
    const ts = now.toLocaleTimeString('en-GB', { hour12: false });
    const date = now.toLocaleDateString('en-GB', { month: 'short', day: '2-digit' }).replace(',','');
    sessionLog.push(`${date} ${ts} zerog5 bash: zerog -- ${cmd}`);
  }

  let lockedExecutable = false;

  const FS = {
    '/': { type: 'dir', children: ['bin', 'dev', 'etc', 'home', 'root', 'var'] },

    '/bin': { type: 'dir', children: ['bash', 'cat', 'ls', 'grep', 'chmod'] },

    '/bin/bash': { type: 'file', binary: true, content:
`00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 305d 4200 0000 0000  ..>.....0]B.....
00000020: 4000 0000 0000 0000 f8b0 0e00 0000 0000  @...............
00000030: 0000 0000 4000 3800 0900 4000 1e00 1d00  ....@.8...@.....
[ELF x86_64 executable — GNU bash 5.2.0]` },

    '/bin/cat': { type: 'file', binary: true, content:
`00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 d011 4000 0000 0000  ..>.......@.....
00000020: 4000 0000 0000 0000 5838 0000 0000 0000  @.......X8......
00000030: 0000 0000 4000 3800 0900 4000 1b00 1a00  ....@.8...@.....
[ELF x86_64 executable — GNU coreutils cat]` },

    '/bin/ls': { type: 'file', binary: true, content:
`00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 e819 4000 0000 0000  ..>.......@.....
00000020: 4000 0000 0000 0000 d8b0 0000 0000 0000  @...............
00000030: 0000 0000 4000 3800 0900 4000 1e00 1d00  ....@.8...@.....
[ELF x86_64 executable — GNU coreutils ls]` },

    '/bin/grep': { type: 'file', binary: true, content:
`00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 f024 4000 0000 0000  ..>......$@.....
00000020: 4000 0000 0000 0000 e8c8 0100 0000 0000  @...............
00000030: 0000 0000 4000 3800 0900 4000 1e00 1d00  ....@.8...@.....
[ELF x86_64 executable — GNU grep 3.8]` },

    '/bin/chmod': { type: 'file', binary: true, content:
`00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 6010 4000 0000 0000  ..>.....60@.....
00000020: 4000 0000 0000 0000 1830 0000 0000 0000  @........0......
00000030: 0000 0000 4000 3800 0900 4000 1b00 1a00  ....@.8...@.....
[ELF x86_64 executable — GNU coreutils chmod]` },

    '/dev': { type: 'dir', children: ['null', 'random', 'zero'] },
    '/dev/null':   { type: 'file', content: '' },
    '/dev/random': { type: 'file', content: 'RXZlcnkgc2luZ2xlIGRlY2lzaW9uIHlvdSd2ZSBtYWRlIHNvIGZhciBoYXMgbGVhZCB5b3UgdG8gdGhpcyBzaXRlLg==' },
    '/dev/zero':   { type: 'file', content: '01000001 01110010 01100101 00100000 01111001 01101111 01110101 00100000 01100001 00100000 00110001 00100000 01101111 01110010 00100000 01100001 00100000 00110000 00111111' },

    '/etc': { type: 'dir', children: ['motd', 'hostname', 'passwd', 'os'] },
    '/etc/motd':       { type: 'file', content: 'Welcome to zerog5.tech terminal v1.0' },
    '/etc/hostname':   { type: 'file', content: 'zerog5' },
    '/etc/passwd':     { type: 'file', content: 'Well, you either read the source code or you actually know me :]\nWhen I think about it now, I don\'t think there\'s a person who knows my password O-O' },
    '/etc/os':         { type: 'file', content: 'Nobara Linux version 43\nCheck out the nobara project: https://nobaraproject.org' },

    '/home': { type: 'dir', children: ['zerog'] },
    '/home/zerog': { type: 'dir', children: ['about.txt', 'skills.txt', 'projects.txt', 'contacts.txt', 'locked.sh', '-', '.hidden.txt'] },

    '/home/zerog/about.txt': { type: 'file', content:
`Hi, I'm ZeroG - the one who built this website. I'm just a 
random 15-year old from Slovakia trying to use the free time
productively and efficiently...that sounded weird. But it's true!
My goal right now is to build and cooporate on as many projects 
as I can. So if you have something, then hit me up through discord: zerog_5` },

    '/home/zerog/skills.txt': { type: 'file', content:
`Languages : Python, HTML/CSS + currently learning: C++, Javascript
Hardware  : Raspberry Pi, breadboard electronics
Interests : Astrophysics, cybersecurity, neurology and aerospace engineering
Practical : non-social skills` },

    '/home/zerog/projects.txt': { type: 'file', content:
`[1] zerog5.tech
    My personal website which you can see right now

[2] Telegram bot
    I programmed a bot that automatically sends notifications 
    when I make changes to this site

[3] Elliptic curves miniguide
    In progress - I've been fascinated by this encryption 
    for some time, but I feel like this is going to hurt...

[4] Solar System simulation
    I've made a modest visualization of our Solar system 
    using real data (I'm working on a newer version)

[5] OpenCTF Portal
    I'm currently working on this with my friends, 
    check us out https://openctf.org

[6] Raspberry pico
    I didn't programme anything innovative
    but rather useful things to have around` },

    '/home/zerog/contacts.txt': { type: 'file', content:
`Discord : zerog_5
Website : zerog5.tech
Username: zerog / ZeroG5` },

    '/home/zerog/locked.sh': { type: 'file', locked: true, content:
`#!/bin/bash
echo "Root? Is that you?"
echo ""` },

    '/home/zerog/-': { type: 'file', dash: true, content:
`This is how it all started. How I began with linux and look 
at me now...obsessed to the point that I'm unable to talk about
anything else and with my social skills down 50%` },

    '/home/zerog/.hidden.txt': { type: 'file', hidden: true, content:
`Out of sight, out of mind...but not for this one.` },

    '/root': { type: 'dir', children: ['.bashrc', '.vimrc', '.bash_history', 'config.txt'] },

    '/root/.bashrc': { type: 'file', hidden: true, content:
`# ~/.bashrc
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000
shopt -s histappend

alias ll='ls -alF'
alias la='ls -A'
alias grep='grep --color=auto'
alias rm='rm -i'
alias ..='cd ..'
alias logs='tail -f /var/log/syslog'
alias nginx-reload='systemctl reload nginx'

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export EDITOR=vim
export LANG=en_US.UTF-8` },

    '/root/.vimrc': { type: 'file', hidden: true, content:
`" ~/.vimrc
set nocompatible
set encoding=utf-8
set number
set relativenumber
set cursorline
set hlsearch
set incsearch
set ignorecase
set smartcase
set tabstop=4
set shiftwidth=4
set expandtab
set smartindent
syntax on
set background=dark
colorscheme desert
nnoremap <C-s> :w<CR>
nnoremap <C-q> :q<CR>` },

    '/root/.bash_history': { type: 'file', hidden: true, content:
`apt update && apt upgrade -y
systemctl restart nginx
tail -f /var/log/syslog
netstat -tulpn
iptables -L -n -v
journalctl -xe
cat /etc/passwd
ssh zerog@zerog5.tech
ls -la /home/zerog
chmod 600 /root/.ssh/id_ed25519
clear` },

    '/root/config.txt': { type: 'file', content:
`site=zerog5.tech
env=production
debug=false
version=1.0.0
db_host=localhost
db_port=5432
ssl=true
backup_cron=0 3 * * *` },

    '/var': { type: 'dir', children: ['log'] },
    '/var/log': { type: 'dir', children: ['syslog', 'session.log'] },
    '/var/log/syslog': { type: 'file', content:
`Jun 14 00:00:01 zerog5 kernel: Command line: BOOT_IMAGE=/vmlinuz-6.x.0-zerog root=/dev/sda1 ro quiet
Jun 14 00:00:02 zerog5 kernel: ACPI: RSDP 0x00000000000F05B0 000024 (v02 BOCHS)
Jun 14 00:00:02 zerog5 systemd[1]: Starting Nobara Linux 43...
Jun 14 00:00:03 zerog5 systemd[1]: Started systemd-journald.service
Jun 14 00:00:03 zerog5 systemd[1]: Starting Network Service...
Jun 14 00:00:04 zerog5 NetworkManager[312]: <info> NetworkManager 1.42.0 starting
Jun 14 00:00:04 zerog5 NetworkManager[312]: <info> eth0: link connected
Jun 14 00:00:05 zerog5 sshd[401]: Server listening on 0.0.0.0 port 22
Jun 14 00:00:06 zerog5 systemd[1]: Startup finished in 4.832s (kernel) + 1.204s (userspace)
Jun 14 12:31:04 zerog5 sshd[1203]: Accepted publickey for zerog from 192.168.1.42 port 51234
Jun 14 12:31:04 zerog5 sshd[1203]: pam_unix(sshd:session): session opened for user zerog
Jun 14 12:31:09 zerog5 sudo[1251]: zerog : TTY=pts/0 ; PWD=/home/zerog ; USER=root ; COMMAND=/bin/bash` },

    '/var/log/session.log': { type: 'file', dynamic: true, content: '' },
  };

  const EASTER = {
    'sudo su':   () => out('No root, just ZeroG.', 'line-err'),
    'hack':      () => out('Seriously?', 'line-err'),
    'date':      () => out(new Date().toString()),
    'id':        () => out('uid=1000(zerog) gid=1000(zerog) groups=1000(zerog),4(adm),27(sudo),1337(elite)'),
    'exit':      () => out('Use shutdown to leave.', 'line-dim'),
    'ping zerog5.tech': () => { out('PING zerog5.tech: 56 bytes of data'); out('64 bytes: icmp_seq=0 time=0.042 ms'); out('64 bytes: icmp_seq=1 time=0.038 ms'); out('64 bytes: icmp_seq=2 time=0.041 ms'); },
  };

  const SETTINGS = {
    autoOpenDelay: 2000,
    doubleEnterMs: 400,
  };

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'terminal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.innerHTML = `
    <div id="terminal-box">
      <div id="terminal-titlebar">
        <span style="margin-left:8px;">zerog@zerog5.tech — bash</span>
        <span style="margin-left:auto;font-size:11px;color:rgba(184, 11, 203, 0.5);">[ESC to hide]</span>
      </div>
      <div id="terminal-output"></div>
      <div id="terminal-inputrow">
        <span id="prompt-label">zerog@zerog5:~$</span>
        <input id="terminal-input" type="text" autocomplete="off" spellcheck="false" />
      </div>
    </div>`;
  document.body.appendChild(overlay);

  let cwd = '/home/zerog';
  let histIdx = -1;
  let lastEnter = 0;
  let booted = false;
  let destroyed = false;

  function resolvePath(p) {
    if (!p || p === '~') return '/home/zerog';
    if (p.startsWith('~')) p = '/home/zerog' + p.slice(1);
    if (!p.startsWith('/')) p = (cwd === '/' ? '' : cwd) + '/' + p;
    const stack = [];
    for (const part of p.split('/').filter(Boolean)) {
      if (part === '.') continue;
      if (part === '..') stack.pop();
      else stack.push(part);
    }
    return '/' + stack.join('/');
  }

  function promptStr() {
    const display = cwd === '/home/zerog' ? '~' : cwd;
    const user = cwd.startsWith('/root') ? 'root' : 'zerog';
    return `${user}@zerog5:${display}$`;
  }

  function out(text, cls = 'line-out') {
    if (destroyed) return;
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = text;
    document.getElementById('terminal-output').appendChild(el);
    document.getElementById('terminal-output').scrollTop = 99999;
  }

  function updatePrompt() {
    const el = document.getElementById('prompt-label');
    if (el) el.textContent = promptStr() + ' ';
  }

  function runDestruction() {
    destroyed = true;
    const deletions = [
      "rm: descending into '/home/zerog'",
      "removed '/home/zerog/about.txt'",
      "removed '/home/zerog/skills.txt'",
      "removed '/home/zerog/projects.txt'",
      "removed '/home/zerog/contacts.txt'",
      "removed '/home/zerog/locked.sh'",
      "removed '/home/zerog/-'",
      "removed '/home/zerog/.hidden.txt'",
      "removed directory '/home/zerog'",
      "rm: descending into '/etc'",
      "removed '/etc/motd'",
      "removed '/etc/hostname'",
      "removed '/etc/passwd'",
      "removed '/etc/os'",
      "removed directory '/etc'",
      "rm: descending into '/var/log'",
      "removed '/var/log/syslog'",
      "removed '/var/log/session.log'",
      "removed directory '/var/log'",
      "removed directory '/var'",
      "rm: descending into '/bin'",
      "removed '/bin/bash'",
      "removed '/bin/cat'",
      "removed '/bin/ls'",
      "removed '/bin/grep'",
      "removed '/bin/chmod'",
      "removed directory '/bin'",
      "rm: descending into '/root'",
      "removed '/root/config.txt'",
      "removed directory '/root'",
      "rm: descending into '/dev'",
      "removed '/dev/null'",
      "removed '/dev/random'",
      "removed '/dev/zero'",
      "removed directory '/dev'",
      "rm: removing directory '/'",
      "",
      "Segmentation fault (core dumped)",
    ];

    destroyed = false;
    document.getElementById('terminal-overlay').classList.add('active');
    destroyed = true;

    const output = document.getElementById('terminal-output');
    let i = 0;
    function printNext() {
      if (i >= deletions.length) {
        setTimeout(() => closeTerminal(), 1500);
        return;
      }
      const el = document.createElement('div');
      el.className = deletions[i] === '' ? 'line-out' : 'line-err';
      el.textContent = deletions[i++];
      output.appendChild(el);
      output.scrollTop = output.scrollHeight;
      setTimeout(printNext, 70);
    }
    printNext();
  }

  const CMDS = {
    help() {
      out('Available commands:', 'line-info');
      out('  ls [path]          -- list directory contents');
      out('  cd [path]          -- change directory');
      out('  cat <file>         -- read file');
      out('  pwd                -- print working directory');
      out('  whoami             -- who are you dealing with');
      out('  uptime             -- site uptime');
      out('  grep <pat> <file>  -- search file for pattern');
      out('  clear              -- clear terminal');
      out('  shutdown           -- leave site');
      out('  help               -- this message');
    },

    pwd() { out(cwd); },

    whoami() { out('zerog'); },

    uptime() {
      const days = Math.floor((Date.now() - new Date('2026-04-01')) / 86400000);
      out(`up ${days} days -- zerog5.tech running without crashing (unlike Windows)`, 'line-info');
    },

    clear() { document.getElementById('terminal-output').innerHTML = ''; },

    shutdown() { setTimeout(() => window.history.back(), 1400); },

    ls(args) {
      let showHidden = false;
      let showLong = false;
      const filtered = [];
      for (const a of args) {
        if (a.startsWith('-')) {
          if (a.includes('a')) showHidden = true;
          if (a.includes('l')) showLong = true;
        } else {
          filtered.push(a);
        }
      }
      const target = filtered[0] ? resolvePath(filtered[0]) : cwd;
      const node = FS[target];
      if (!node) { out(`ls: cannot access '${filtered[0]||'.'}': No such file or directory`, 'line-err'); return; }
      if (node.type === 'file') { out(filtered[0]); return; }

      const allChildren = Object.keys(FS)
        .filter(k => {
          const parent = k.substring(0, k.lastIndexOf('/')) || '/';
          return parent === target && k !== target;
        })
        .map(k => k.split('/').pop());

      const unique = [...new Set([...(node.children||[]), ...allChildren])];
      const visible = unique.filter(name => showHidden || !name.startsWith('.'));
      if (!visible.length) return;

      if (showLong) {
        out('total ' + visible.length, 'line-dim');
        out('drwxr-xr-x  zerog  zerog  .', 'line-dim');
        out('drwxr-xr-x  zerog  zerog  ..', 'line-dim');
        for (const name of visible) {
          const fullPath = (target === '/' ? '' : target) + '/' + name;
          const child = FS[fullPath];
          const isDir = child && child.type === 'dir';
          const isLocked = child && child.locked && !lockedExecutable;
          const perm = isDir ? 'drwxr-xr-x' : (isLocked ? '----------' : '-rw-r--r--');
          const color = name.startsWith('.') ? 'line-dim' : (isDir ? 'line-info' : 'line-out');
          out(`${perm}  zerog  zerog  ${name}`, color);
        }
      } else {
        out(visible.join('    '));
      }
    },

    cd(args) {
      const target = resolvePath(args[0] || '~');
      const node = FS[target];
      if (!node) { out(`cd: ${args[0]}: No such file or directory`, 'line-err'); return; }
      if (node.type !== 'dir') { out(`cd: ${args[0]}: Not a directory`, 'line-err'); return; }
      cwd = target;
      updatePrompt();
    },

    cat(args) {
      if (!args[0]) { out('cat: missing operand', 'line-err'); return; }
      let fname = args[0];
      let isDash = false;
      if (fname === './-') { fname = '-'; isDash = true; }
      else if (fname === '-') {
        out('cat: invalid argument', 'line-err');
        return;
      }
      const resolved = isDash
        ? (cwd === '/' ? '' : cwd) + '/' + fname
        : resolvePath(fname);
      const node = FS[resolved];
      if (!node) { out(`cat: ${args[0]}: No such file or directory`, 'line-err'); return; }
      if (node.type === 'dir') { out(`cat: ${args[0]}: Is a directory`, 'line-err'); return; }
      if (node.locked && !lockedExecutable) {
        out(`cat: ${fname}: Permission denied`, 'line-err');
        return;
      }
      if (node.dynamic) {
        if (sessionLog.length === 0) {
          out('(no commands logged yet in this session)', 'line-dim');
        } else {
          sessionLog.forEach(l => out(l));
        }
        return;
      }
      if (resolved === '/etc/passwd') {
        const answer = prompt('What is my real name?');
        if (!answer || answer.trim() !== 'Laura') {
          out('cat: /etc/passwd: Access denied', 'line-err');
          return;
        }
      }
      out(node.content);
    },

    chmod(args) {
      if (args.length < 2) { out('Usage: chmod +x <file>', 'line-err'); return; }
      const [mode, fname] = args;
      if (mode !== '+x') { out(`chmod: invalid mode: '${mode}'`, 'line-err'); return; }
      const resolved = resolvePath(fname);
      const node = FS[resolved];
      if (!node) { out(`chmod: cannot access '${fname}': No such file or directory`, 'line-err'); return; }
      if (node.locked) {
        lockedExecutable = true;
        out(`mode of '${fname}' changed from 0000 (---------) to 0111 (--x--x--x)`, 'line-info');
      } else {
        out(`mode of '${fname}' changed`, 'line-dim');
      }
    },

    grep(args) {
      if (args.length < 2) { out('Usage: grep <pattern> <file>', 'line-err'); return; }
      const [pat, fname] = args;
      const node = FS[resolvePath(fname)];
      if (!node || node.type === 'dir') { out(`grep: ${fname}: No such file`, 'line-err'); return; }
      if (node.locked && !lockedExecutable) { out(`grep: ${fname}: Permission denied`, 'line-err'); return; }
      const content = node.dynamic ? sessionLog.join('\n') : node.content;
      const lines = content.split('\n').filter(l => new RegExp(pat, 'i').test(l));
      if (!lines.length) out(`(no match for '${pat}')`, 'line-dim');
      else lines.forEach(l => out(l));
    },
  };

  function runCommand(raw) {
    if (destroyed) return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    logCmd(trimmed);
    histIdx = -1;

    const el = document.createElement('div');
    el.className = 'line-cmd';
    el.textContent = promptStr() + ' ' + trimmed;
    document.getElementById('terminal-output').appendChild(el);

    if (/^rm\s+-rf\s+\/\s*$/.test(trimmed)) {
      out("rm: it is dangerous to operate recursively on '/'", 'line-err');
      out("rm: use 'sudo rm -rf /' to override this failsafe", 'line-err');
      return;
    }

    if (/^sudo\s+rm\s+-rf\s+\/\s*$/.test(trimmed)) {
      out('[sudo] password for zerog: ', 'line-dim');
      setTimeout(() => runDestruction(), 900);
      return;
    }

    const lower = trimmed.toLowerCase();
    if (EASTER[lower]) { EASTER[lower](); return; }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    if (CMDS[cmd]) CMDS[cmd](args);
    else out(`bash: ${cmd}: command not found -- type 'help' for commands`, 'line-err');

    document.getElementById('terminal-output').scrollTop = 99999;
  }

  function boot() {
    if (booted) return;
    booted = true;
    out(ASCII_LOGO, 'line-ascii');
    out('');
    out('ZeroG Terminal v1.0  --  zerog5.tech', 'line-info');
    out("Type 'help' to see available commands. Have fun ;)", 'line-dim');
    out('');
  }

  function openTerminal() {
    if (destroyed) return;
    document.getElementById('terminal-overlay').classList.add('active');
    boot();
    setTimeout(() => document.getElementById('terminal-input').focus(), 50);
  }

  function closeTerminal() {
    document.getElementById('terminal-overlay').classList.remove('active');
  }

  setTimeout(openTerminal, SETTINGS.autoOpenDelay);

  document.getElementById('terminal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('terminal-overlay')) closeTerminal();
  });
  document.getElementById('terminal-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const v = document.getElementById('terminal-input').value;
      document.getElementById('terminal-input').value = '';
      runCommand(v);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < sessionLog.length - 1) histIdx++;
      document.getElementById('terminal-input').value = (sessionLog[sessionLog.length - 1 - histIdx] || '').replace(/^.*-- /, '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) histIdx--;
      else { histIdx = -1; document.getElementById('terminal-input').value = ''; return; }
      document.getElementById('terminal-input').value = (sessionLog[sessionLog.length - 1 - histIdx] || '').replace(/^.*-- /, '');
    }
    if (e.key === 'Escape') closeTerminal();
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); CMDS.clear(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !document.getElementById('terminal-overlay').classList.contains('active')) {
      const now = Date.now();
      if (now - lastEnter < SETTINGS.doubleEnterMs) openTerminal();
      lastEnter = now;
    }
  });
})();