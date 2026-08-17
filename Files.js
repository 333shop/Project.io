const selectBtn = document.getElementById('selectFolderBtn');
const folderInput = document.getElementById('folderInput');
const treeRoot = document.getElementById('treeRoot');
const emptyMsg = document.getElementById('emptyMsg');
const itemCount = document.getElementById('itemCount');
const toast = document.getElementById('toast');

selectBtn.addEventListener('click', () => folderInput.click());

folderInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    buildTree(files);
});

function buildTree(files) {
    const root = { name: '', children: {}, isFolder: true, path: '' };

    files.forEach(file => {
        const parts = (file.webkitRelativePath || file.name).split('/');
        let current = root;

        parts.forEach((part, idx) => {
            if (!part) return;
            const isLast = idx === parts.length - 1;
            if (!current.children[part]) {
                current.children[part] = {
                    name: part,
                    children: {},
                    isFolder: !isLast,
                    path: parts.slice(0, idx + 1).join('/'),
                    size: isLast ? file.size : 0,
                    file: isLast ? file : null
                };
            }
            if (isLast) {
                current.children[part].isFolder = false;
                current.children[part].size = file.size;
                current.children[part].file = file;
            }
            current = current.children[part];
        });
    });

    const topKeys = Object.keys(root.children);
    let displayRoot = root;

    if (topKeys.length === 1 && root.children[topKeys[0]].isFolder) {
        displayRoot = root.children[topKeys[0]];
        displayRoot.path = topKeys[0];
    }

    treeRoot.innerHTML = '';
    emptyMsg.style.display = 'none';
    treeRoot.style.display = 'block';

    const nodes = Object.values(displayRoot.children);
    let total = 0;

    function countAll(node) {
        total++;
        Object.values(node.children || {}).forEach(countAll);
    }
    nodes.forEach(countAll);
    itemCount.textContent = total + ' item' + (total !== 1 ? 's' : '');

    nodes
        .sort((a, b) => {
            if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
            return a.name.localeCompare(b.name);
        })
        .forEach(node => {
            treeRoot.appendChild(createTreeItem(node, 0));
        });
}

function createTreeItem(node, depth) {
    const li = document.createElement('li');
    li.className = 'tree-item';

    const row = document.createElement('div');
    row.className = 'tree-row' + (node.isFolder ? ' folder' : '');
    row.style.paddingLeft = (8 + depth * 16) + 'px';

    const toggle = document.createElement('span');
    toggle.className = 'toggle' + (node.isFolder && Object.keys(node.children).length ? '' : ' empty');
    toggle.innerHTML = '▶';
    row.appendChild(toggle);

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.innerHTML = node.isFolder ? folderIcon() : fileIcon(node.name);
    row.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = node.name;
    row.appendChild(name);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.title = 'Copy path';
    copyBtn.innerHTML = copyIcon();
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(node.path).then(() => {
            showToast('Path copied: ' + node.path);
        });
    });
    actions.appendChild(copyBtn);
    row.appendChild(actions);

    li.appendChild(row);

    if (node.isFolder) {
        const childrenUl = document.createElement('ul');
        childrenUl.className = 'tree-children';

        const childNodes = Object.values(node.children)
            .sort((a, b) => {
                if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
                return a.name.localeCompare(b.name);
            });

        childNodes.forEach(child => {
            childrenUl.appendChild(createTreeItem(child, depth + 1));
        });

        li.appendChild(childrenUl);

        row.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) return;
            const isOpen = childrenUl.classList.toggle('open');
            toggle.classList.toggle('open', isOpen);
            row.classList.toggle('selected', isOpen);
        });
    } else {
        row.addEventListener('click', () => {
            document.querySelectorAll('.tree-row.selected').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
        });
    }

    return li;
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
}

function folderIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="#ff8a8a" stroke-width="1.6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
}

function fileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const colors = {
        lua: '#ff6b6b',
        luau: '#ff6b6b',
        json: '#ffaa66',
        rbxl: '#66aaff',
        rbxlx: '#66aaff',
        png: '#88cc88',
        jpg: '#88cc88',
        jpeg: '#88cc88',
        txt: '#aaa',
        md: '#aaa'
    };
    const c = colors[ext] || '#999';
    return `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
}

function copyIcon() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
}
