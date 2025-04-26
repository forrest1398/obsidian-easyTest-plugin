import EasyTestPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
export interface EasyTestSettings {
	koColor: string;
	koBackgroundColor: string;
	enColor: string;
	enBackgroundColor: string;
	jaColor: string;
	jaBackgroundColor: string;
	numColor: string;
	numBackgroundColor: string;
}

export const DEFAULT_SETTINGS: Partial<EasyTestSettings> = {
	koColor: "#f4e1c1",
	koBackgroundColor: "rgba(244, 225, 193, 0.3)",
	enColor: "#b3e5fc",
	enBackgroundColor: "rgba(179, 229, 252, 0.3)",
	jaColor: "#ccaaff",
	jaBackgroundColor: "rgba(242, 222, 251, 0.3)",
	numColor: "#e0e0e0",
	numBackgroundColor: "rgba(224, 224, 224, 0.3)",
};

export class EasyTestSettingTab extends PluginSettingTab {
	plugin: EasyTestPlugin;

	constructor(app: App, plugin: EasyTestPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h1", { text: "Color Settings" });

		containerEl.createDiv();

		new Setting(containerEl)
			.setName("Number Input Border Color")
			.addText((text) =>
				text
					.setPlaceholder("#ffffff")
					.setValue(this.plugin.settings.numColor)
					.onChange(async (value) => {
						this.plugin.settings.numColor = value;
						await this.plugin.saveSettings();
					})
			);

		// Korean background color
		new Setting(containerEl)
			.setName("Number Input Background Color")
			.addText((text) =>
				text
					.setPlaceholder("rgba(244, 225, 193, 0.3)")
					.setValue(this.plugin.settings.numBackgroundColor)
					.onChange(async (value) => {
						this.plugin.settings.numBackgroundColor = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
