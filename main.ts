import {
	App,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	MarkdownRenderer,
	Component,
} from "obsidian";

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
		this.addSettingTab(new EasyTestPluginSettingTab(this.app, this));

		// Add ribbonIcon creating test
		const openTestIcon = this.addRibbonIcon(
			"notebook-pen",
			"Open Test",
			(evt: MouseEvent) => {
				const editor = this.app.workspace.activeEditor?.editor;
				if (!editor) {
					new Notice("No active editor found.");
					return;
				}

				const doc = editor.getDoc?.();
				if (!doc) {
					new Notice("The editor does not have a valid document.");
					return;
				}

				const markdownContent = doc.getValue() || "";
				const title = this.app.workspace.getActiveFile()?.basename;

				new TestModal(this.app, title, markdownContent).open();
			}
		);

		//------------------------------------ 아직 학습하지 못한 코드 ---------------------------------------------
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

class TestModal extends Modal {
	component: Component;
	content: string;
	title: string;

	constructor(app: App, title: any, content: any) {
		super(app);
		this.content = content;
		this.component = new Component();
		this.title = title;

		//Modal 스타일링
		this.modalEl.style.width = "800px";
		this.modalEl.style.margin = " 0 auto";
		this.modalEl.style.padding = "0 50px 0 50px";
	}
	onOpen() {
		this.contentEl.createEl("h1", { text: this.title });
		this.component.load();

		// content 수정
		// 볼드체를 각 글자별 <input>으로 변경
		this.content = this.content.replace(
			/\*\*(.*?)\*\*/g,
			(match: string, group: string) => {
				return (
					group
						// 글자 단위로 split
						.split("")
						// 글자마다 input 생성
						.map((char: string) => {
							// 띄어쓰기는 input이 아닌 span태그로 변환
							if (char === " ") {
								return `<span style="display: inline-block; width: 10px;"></span>`;
							}

							return `<input class="test-input" type="text" maxlength="1"/>`;
						})
						.join("")
				); // Recombine characters
			}
		);

		// 마크다운 문자열을 html element로 레더링
		MarkdownRenderer.render(
			this.app,
			this.content,
			this.contentEl,
			"",
			this.component
		);
	}

	onClose() {
		this.component.unload();
	}
}
