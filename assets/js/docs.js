document.querySelectorAll('.navbar-burger').forEach((button) => {
	const target = document.getElementById(button.dataset.target);
	if (!target) {
		return;
	}

	button.addEventListener('click', () => {
		target.classList.toggle('is-active');
		button.classList.toggle('is-active');
	})
});
