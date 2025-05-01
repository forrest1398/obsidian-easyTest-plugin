import EasyTestPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface EasyTestSettings {
	[lang: string]: {
		title: string;
		borderColor: string;
		backgroundColor: string;
	};
}

export const DEFAULT_SETTINGS: EasyTestSettings = {
	ko: {
		title: "Korean",
		borderColor: "#f4e1c1",
		backgroundColor: "#f4e1c1",
	},
	en: {
		title: "English",
		borderColor: "#b3e5fc",
		backgroundColor: "#b3e5fc",
	},
	ja: {
		title: "Japanese",
		borderColor: "#ccaaff",
		backgroundColor: "#f2defb",
	},
	num: {
		title: "Number",
		borderColor: "#e0e0e0",
		backgroundColor: "#e0e0e0",
	},
};

export class EasyTestSettingTab extends PluginSettingTab {
	plugin: EasyTestPlugin;

	constructor(app: App, plugin: EasyTestPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h1", { text: "Input Box Color Settings" });

		// Input 프리뷰 맵 생성
		const previewMap = new Map<string, HTMLInputElement>();

		// 언어별 설정 생성
		for (const lang in this.plugin.settings) {
			const langSetting = this.plugin.settings[lang];
			const setting = new Setting(containerEl).setName(
				`${langSetting.title}`
			);

			// Border 설정
			setting.settingEl.createDiv({ cls: "color-setting-row" }, (div) => {
				div.createSpan({ text: "Border", cls: "color-label" });

				const borderInput = div.createEl("input", { type: "color" });
				borderInput.value = langSetting.borderColor;
				borderInput.addEventListener("input", async (e) => {
					const value = (e.target as HTMLInputElement).value;
					this.plugin.settings[lang].borderColor = value;
					await this.plugin.saveSettings();
					previewMap.get(lang)!.style.borderColor = value;
				});
			});

			// Background 설정
			setting.settingEl.createDiv({ cls: "color-setting-row" }, (div) => {
				div.createSpan({ text: "Background", cls: "color-label" });

				const backgroundInput = div.createEl("input", {
					type: "color",
				});
				backgroundInput.value = langSetting.backgroundColor;
				backgroundInput.addEventListener("input", async (e) => {
					const value = (e.target as HTMLInputElement).value;
					this.plugin.settings[lang].backgroundColor = value;
					await this.plugin.saveSettings();
					previewMap.get(lang)!.style.backgroundColor = value;
				});
			});

			// Preview 추가
			setting.settingEl.createDiv({ cls: "preview-wrapper" }, (div) => {
				const preview = this.createPreview(lang);
				previewMap.set(lang, preview);
				div.appendChild(preview);
			});
		}
	}

	// 언어별 Input 프리뷰 생성 함수
	createPreview(language: string) {
		const preview = document.createElement("input");
		preview.type = "text";
		preview.addClass("test-input");
		preview.style.borderColor = this.plugin.settings[language].borderColor;
		preview.style.backgroundColor =
			this.plugin.settings[language].backgroundColor;
		return preview;
	}
}
