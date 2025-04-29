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
		backgroundColor: "rgba(244, 225, 193, 0.3)",
	},
	en: {
		title: "English",
		borderColor: "#b3e5fc",
		backgroundColor: "rgba(179, 229, 252, 0.3)",
	},
	ja: {
		title: "Japanese",
		borderColor: "#ccaaff",
		backgroundColor: "rgba(242, 222, 251, 0.3)",
	},
	num: {
		title: "Number",
		borderColor: "#e0e0e0",
		backgroundColor: "rgba(224, 224, 224, 0.3)",
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

		// 언어별 프리뷰 맵 생성
		const previewMap = new Map<string, HTMLInputElement>();

		// input 프리뷰 생성 함수
		const createPreview = (lang: string) => {
			const preview = document.createElement("input");
			preview.type = "text";
			preview.addClass("test-input");
			preview.style.borderColor = this.plugin.settings[lang].borderColor;
			preview.style.backgroundColor =
				this.plugin.settings[lang].backgroundColor;
			return preview;
		};

		// 언어별 설정 생성
		for (const lang in this.plugin.settings) {
			const langSetting = this.plugin.settings[lang];
			const preview = createPreview(lang);
			previewMap.set(lang, preview);

			// 설정 폼 추가
			new Setting(containerEl)
				.setName(`${langSetting.title}`)
				.addText((text) => {
					text.setPlaceholder("Border")
						.setValue(langSetting.borderColor)
						.onChange(async (value) => {
							this.plugin.settings[lang].borderColor = value;
							await this.plugin.saveSettings();
							previewMap.get(lang)!.style.borderColor = value;
						});
				})
				.addText((text) => {
					text.setPlaceholder("Background")
						.setValue(langSetting.backgroundColor)
						.onChange(async (value) => {
							this.plugin.settings[lang].backgroundColor = value;
							await this.plugin.saveSettings();

							previewMap.get(lang)!.style.backgroundColor = value;
						});
				})
				.settingEl.createDiv({ cls: "preview-wrapper" }, (div) => {
					div.appendChild(preview);
				});
		}
	}
}
