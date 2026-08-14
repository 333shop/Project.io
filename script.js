let isLoginMode = true;
let currentTicketId = null;
let tickets = JSON.parse(localStorage.getItem('wyvern_tickets') || '[]');

function showPage(page) {
	document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
	document.getElementById('page-' + page).classList.add('active');
	document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
	const nav = document.getElementById('nav-' + page);
	if (nav) nav.classList.add('active');
	if (page === 'tickets') renderTicketList();
}

window.onload = function() {
	const user = JSON.parse(localStorage.getItem('wyvern_user'));
	if (user) showLoggedIn(user);
};

function openModal(type) {
	clearErrors();
	if (type === 'edit') {
		const user = JSON.parse(localStorage.getItem('wyvern_user'));
		document.getElementById('editUsername').value = user.username;
		document.getElementById('editEmail').value = user.email;
		document.getElementById('editPassword').value = '';
		document.getElementById('editModal').classList.add('active');
		return;
	}
	isLoginMode = (type === 'login');
	updateModal();
	document.getElementById('authModal').classList.add('active');
}

function closeModal() {
	document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
	clearErrors();
}

function switchMode() {
	isLoginMode = !isLoginMode;
	clearErrors();
	updateModal();
}

function updateModal() {
	const title = document.getElementById('modalTitle');
	const subtitle = document.getElementById('modalSubtitle');
	const submit = document.getElementById('authSubmit');
	const switchText = document.getElementById('switchText');
	const usernameGroup = document.getElementById('usernameGroup');

	if (isLoginMode) {
		title.textContent = 'Welcome back';
		subtitle.textContent = 'Login to your account';
		submit.textContent = 'Login';
		switchText.innerHTML = `Don't have an account? <span onclick="switchMode()">Sign up</span>`;
		usernameGroup.style.display = 'none';
	} else {
		title.textContent = 'Create account';
		subtitle.textContent = 'Sign up for Wyvern';
		submit.textContent = 'Sign Up';
		switchText.innerHTML = `Already have an account? <span onclick="switchMode()">Login</span>`;
		usernameGroup.style.display = 'block';
	}
}

function clearErrors() {
	document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
	document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
	document.querySelectorAll('.form-warning').forEach(el => el.classList.remove('show'));
}

function showError(inputId, errorId) {
	document.getElementById(inputId).classList.add('error');
	document.getElementById(errorId).classList.add('show');
}

function validateEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleAuth(e) {
	e.preventDefault();
	clearErrors();

	const username = document.getElementById('username').value.trim();
	const email = document.getElementById('email').value.trim();
	const password = document.getElementById('password').value;
	let hasError = false;

	if (!isLoginMode && username.length < 3) {
		showError('username', 'usernameError');
		hasError = true;
	}
	if (!email || !validateEmail(email)) {
		showError('email', 'emailError');
		hasError = true;
	}
	if (password.length < 6) {
		showError('password', 'passwordError');
		hasError = true;
	}
	if (hasError) {
		document.getElementById('formWarning').textContent = 'Please fix the errors above';
		document.getElementById('formWarning').classList.add('show');
		return;
	}

	const user = {
		username: isLoginMode ? email.split('@')[0] : username,
		email,
		password
	};

	localStorage.setItem('wyvern_user', JSON.stringify(user));
	showLoggedIn(user);
	closeModal();
	showToast(isLoginMode ? 'Successfully logged in' : 'Account created successfully');
	document.getElementById('authForm').reset();
}

function showLoggedIn(user) {
	document.getElementById('guestButtons').style.display = 'none';
	document.getElementById('userMenu').style.display = 'flex';
	document.getElementById('displayName').textContent = user.username;
	document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
	const heroBtns = document.getElementById('heroButtons');
	if (heroBtns) heroBtns.style.display = 'none';
}

function logout() {
	localStorage.removeItem('wyvern_user');
	document.getElementById('guestButtons').style.display = 'flex';
	document.getElementById('userMenu').style.display = 'none';
	document.getElementById('heroButtons').style.display = 'flex';
	showToast('Logged out');
}

function saveEdit(e) {
	e.preventDefault();
	clearErrors();
	const username = document.getElementById('editUsername').value.trim();
	const email = document.getElementById('editEmail').value.trim();
	const newPass = document.getElementById('editPassword').value;
	let hasError = false;

	if (username.length < 3) {
		showError('editUsername', 'editUsernameError');
		hasError = true;
	}
	if (!email || !validateEmail(email)) {
		showError('editEmail', 'editEmailError');
		hasError = true;
	}
	if (newPass && newPass.length < 6) {
		showError('editPassword', 'editPasswordError');
		hasError = true;
	}

	if (hasError) {
		document.getElementById('editWarning').textContent = 'Please fix the errors above';
		document.getElementById('editWarning').classList.add('show');
		return;
	}

	const user = JSON.parse(localStorage.getItem('wyvern_user'));
	user.username = username;
	user.email = email;
	if (newPass) user.password = newPass;
	localStorage.setItem('wyvern_user', JSON.stringify(user));
	showLoggedIn(user);
	closeModal();
	showToast('Account updated successfully');
}

function openNewTicketModal() {
	const user = JSON.parse(localStorage.getItem('wyvern_user'));
	if (!user) {
		showToast('Please login first to create a ticket');
		openModal('login');
		return;
	}
	document.getElementById('ticketSubject').value = '';
	document.getElementById('ticketMessage').value = '';
	document.getElementById('newTicketModal').classList.add('active');
}

function createTicket(e) {
	e.preventDefault();
	const user = JSON.parse(localStorage.getItem('wyvern_user'));
	const subject = document.getElementById('ticketSubject').value.trim();
	const message = document.getElementById('ticketMessage').value.trim();

	if (!subject || !message) return;

	const ticket = {
		id: Date.now().toString(),
		subject,
		status: 'open',
		user: user.username,
		email: user.email,
		created: new Date().toLocaleString(),
		messages: [
			{ from: 'user', name: user.username, text: message, time: new Date().toLocaleString() }
		]
	};

	tickets.unshift(ticket);
	localStorage.setItem('wyvern_tickets', JSON.stringify(tickets));
	closeModal();
	renderTicketList();
	openTicket(ticket.id);
	showToast('Ticket created successfully');
}

function renderTicketList() {
	const list = document.getElementById('ticketList');

	if (tickets.length === 0) {
		list.innerHTML = '<p style="color:#71717a;font-size:0.9rem;text-align:center;padding:20px 0;">No tickets yet</p>';
		return;
	}

	list.innerHTML = tickets.map(t => `
		<div class="ticket-item ${currentTicketId === t.id ? 'active' : ''}" onclick="openTicket('${t.id}')">
			<div class="ticket-title">${t.subject}</div>
			<div class="ticket-meta">
				${t.user} • ${t.created}
				<span class="ticket-status ${t.status === 'open' ? 'status-open' : 'status-closed'}">${t.status}</span>
			</div>
		</div>
	`).join('');
}

function openTicket(id) {
	currentTicketId = id;
	const ticket = tickets.find(t => t.id === id);
	if (!ticket) return;

	document.getElementById('ticketEmpty').style.display = 'none';
	document.getElementById('ticketContent').style.display = 'flex';

	document.getElementById('currentTicketTitle').textContent = ticket.subject;
	const statusEl = document.getElementById('currentTicketStatus');
	statusEl.textContent = ticket.status;
	statusEl.className = 'ticket-status ' + (ticket.status === 'open' ? 'status-open' : 'status-closed');

	document.getElementById('closeTicketBtn').style.display = ticket.status === 'open' ? 'block' : 'none';
	document.getElementById('ticketInputArea').style.display = ticket.status === 'open' ? 'flex' : 'none';

	const messagesEl = document.getElementById('ticketMessages');
	messagesEl.innerHTML = ticket.messages.map(m => `
		<div class="message ${m.from}">
			<div class="msg-meta">${m.name} • ${m.time}</div>
			${m.text}
		</div>
	`).join('');

	messagesEl.scrollTop = messagesEl.scrollHeight;
	renderTicketList();
}

function sendReply() {
	const input = document.getElementById('ticketReply');
	const text = input.value.trim();
	if (!text || !currentTicketId) return;

	const user = JSON.parse(localStorage.getItem('wyvern_user'));
	const ticket = tickets.find(t => t.id === currentTicketId);
	if (!ticket || ticket.status === 'closed') return;

	ticket.messages.push({
		from: 'user',
		name: user ? user.username : 'Guest',
		text,
		time: new Date().toLocaleString()
	});

	localStorage.setItem('wyvern_tickets', JSON.stringify(tickets));
	input.value = '';
	openTicket(currentTicketId);
}

function closeCurrentTicket() {
	if (!currentTicketId) return;
	const ticket = tickets.find(t => t.id === currentTicketId);
	if (!ticket) return;
	ticket.status = 'closed';
	localStorage.setItem('wyvern_tickets', JSON.stringify(tickets));
	openTicket(currentTicketId);
	showToast('Ticket closed');
}

function showToast(message) {
	const toast = document.getElementById('toast');
	toast.textContent = message;
	toast.classList.add('show');
	setTimeout(() => toast.classList.remove('show'), 2500);
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
	overlay.addEventListener('click', function(e) {
		if (e.target === this) closeModal();
	});
});
