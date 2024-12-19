import {
	App,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

//TODO : Remember to rename these classes and interfaces!

interface EasyTestPluginSettings {}

const DEFAULT_SETTINGS: EasyTestPluginSettings = {};

class EasyTestPluginSettingTab extends PluginSettingTab {
	plugin: EasyTestPlugin;

	constructor(app: App, plugin: EasyTestPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h1", {
			text: "There is nothing to set . . . yet",
		});
	}
}

export default class EasyTestPlugin extends Plugin {
	settings: EasyTestPluginSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbonIcon creating modal
		const ribbonIconEl = this.addRibbonIcon(
			"ribbon",
			"Make Test",
			(evt: MouseEvent) => {
				new Notice("Hello, world");
			}
		);

		this.addSettingTab(new EasyTestPluginSettingTab(this.app, this));

		// 아직 학습하지 못한 코드
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
