import {
	EasyTestSettingTab,
	EasyTestSettings,
	DEFAULT_SETTINGS,
} from "./settings";
import { Notice, Plugin, Editor, MarkdownView } from "obsidian";
import { TestModal } from "./testModal";

export default class EasyTestPlugin extends Plugin {
	settings: EasyTestSettings;

	async onload() {
		await this.loadSettings();

		// RibbonIcon 추가
		const openTestIcon = this.addRibbonIcon(
			"notebook-pen",
			"Open test",
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

				new TestModal(
					this.app,
					title,
					markdownContent,
					this.settings
				).open();
			}
		);

		// Command 추가
		this.addCommand({
			id: "create-test-command",
			name: "Create test command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const doc = editor.getDoc?.();
				if (!doc) {
					new Notice("The editor does not have a valid document.");
					return;
				}
				const markdownContent = doc.getValue() || "";
				const title = this.app.workspace.getActiveFile()?.basename;

				const modal = new TestModal(
					this.app,
					title,
					markdownContent,
					this.settings
				).open();
			},
		});

		// Setting 추가
		this.addSettingTab(new EasyTestSettingTab(this.app, this));
	}

	// Setting 함수들
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
