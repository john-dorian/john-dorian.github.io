class JD_Tabs {
	constructor(tabs, options) {
		this.tabsElem = tabs;
		this.tabList = this.tabsElem.querySelector('[role="tablist"]');

		if (typeof options === 'undefined') {
			options = {};
		}

		this.options = options;

		this.options.delay = this.options.delay ? parseInt(this.options.delay) : 300;

		this.initElems();
		this.buildTabsListeners();
	}

	initElems() {
		this.tabs = this.tabList.querySelectorAll('[role="tab"]');
		this.panels = this.tabsElem.querySelectorAll('[role="tabpanel"]');
	}

	buildTabsListeners() {
		this.tabs.forEach((tab) => {
			tab.addEventListener('click', () => {
				this.onTabClick(tab);
			});
			tab.addEventListener('keydown', (event) => {
				this.onTabKeyDown(tab, event);
			});
			tab.addEventListener('keyup', (event) => {
				this.onTabKeyUp(tab, event);
			});
		});
	}

	onTabClick(tab) {
		this.activateTab(tab, false);
	}

	onTabKeyDown(tab, event) {
		const key = event.keyCode;

		switch (key) {
			case this.keys.end:
				event.preventDefault();
				this.activateTab(this.tabs[this.tabs.length - 1]);
				break;
			case this.keys.home:
				event.preventDefault();
				this.activateTab(this.tabs[0]);
				break;

			case this.keys.up:
			case this.keys.down:
				this.determineOrientation(event);
				break;
		}
	}

	onTabKeyUp(tab, event) {
		const key = event.keyCode;

		switch (key) {
			case this.keys.left:
			case this.keys.right:
				this.determineOrientation(event);
				break;
			case this.keys.delete:
				this.determineDeletable(event);
				break;
		}
	}

	determineOrientation(event) {
		const key = event.keyCode;
		const vertical = this.tabList.getAttribute('aria-orientation') === 'vertical';
		let proceed = false;

		if (vertical) {
			if (key === this.keys.up || key === this.keys.down) {
				event.preventDefault();
				proceed = true;
			}
		}
		else {
			if (key === this.keys.left || key === this.keys.right) {
				proceed = true;
			}
		}

		if (proceed) {
			this.switchTabOnArrowPress(event);
		}
	}

	switchTabOnArrowPress(event) {
		const key = event.keyCode;

		this.tabs.forEach((tab) => {
			tab.addEventListener('focus', (event) => {
				this.focusEventHandler(event);
			});
		});

		if (this.directions[key]) {
			let target;
			let index;
			this.tabs.forEach((tab, i) => {
				if (tab === event.target) {
					target = tab;
					index = i;
				}
			});

			if (!target) {
				throw new Error('Target tab not found');
			}

			if (index !== undefined) {
				if (this.tabs[index + this.directions[key]]) {
					this.tabs[index + this.directions[key]].focus();
				}
				else if (key === this.keys.left || key === this.keys.up) {
					this.focusLastTab();
				}
				else if (key === this.keys.right || key == this.keys.down) {
					this.focusFirstTab();
				}
			}
		}
	}

	activateTab(tab, setFocus) {
		setFocus = setFocus || true;

		this.deactivateTabs();

		tab.removeAttribute('tabindex');

		tab.setAttribute('aria-selected', 'true');

		const controls = tab.getAttribute('aria-controls');

		document.getElementById(controls).removeAttribute('hidden');

		if (setFocus) {
			tab.focus();
		}
	}

	deactivateTabs() {
		this.tabs.forEach((tab) => {
			tab.setAttribute('tabindex', '-1');
			tab.setAttribute('aria-selected', 'false');
			tab.removeEventListener('focus', this.focusEventHandler);
		});

		this.panels.forEach((panel) => {
			panel.setAttribute('hidden', 'hidden');
		});
	}

	focusFirstTab() {
		this.tabs[0].focus();
	}

	focusLastTab() {
		this.tabs[this.tabs.length - 1].focus();
	}

	determineDeletable(event) {
		const target = event.target;

		if (target.dataset.deletable) {
			this.deleteTab(event, target);

			this.initElems();

			if (target.index - 1 < 0) {
				this.activateTab(this.tabs[0]);
			}
			else {
				this.activateTab(this.tabs[target.index - 1]);
			}
		}
	}

	deleteTab(event, tab) {
		tab = tab || event.target;
		const panel = this.tabsElem.getElementById(tab.getAttribute('aria-controls'));

		tab.parentElement.removeChild(tab);
		panel.parentElement.removeChild(panel);
	}

	focusEventHandler(event) {
		const target = event.target;

		setTimeout(() => {
			this.checkTabFocus(target);
		}, this.options.delay);
	}

	checkTabFocus(target) {
		const focused = document.activeElement;

		if (target === focused) {
			this.activateTab(target, false);
		}
	}
}

JD_Tabs.prototype.keys = {
	end: 35,
	home: 36,
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	delete: 46
};
JD_Tabs.prototype.directions = {
	37: -1,
	38: -1,
	39: 1,
	40: 1
};

document.querySelectorAll('[data-jd-tabs]').forEach((tabs) => {
	new JD_Tabs(tabs, tabs.dataset);
});
