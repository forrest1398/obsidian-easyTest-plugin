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

		//Modal 스타일링 클래스 추가
		this.modalEl.addClass("test-modal");
	}
	onOpen() {
		this.contentEl.createEl("h1", { text: this.title });
		this.component.load();

		// input 태그의 순차적 id생성을 위한 변수
		let inputCounter = 1;

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
							// 글자의 종류를 영어,숫자,한국어로 분류
							let charClass = "";
							if (/^[a-zA-Z]$/.test(char)) {
								charClass = "en";
							} else if (/^[0-9]$/.test(char)) {
								charClass = "num";
							} else if (/^[가-힣]$/.test(char)) {
								charClass = "ko";
							}
							// 띄어쓰기는 input이 아닌 span태그로 변환
							else if (char === " ") {
								return `<span style="display: inline-block; width: 10px;"></span>`;
							}
							// 이외 글자는 특수문자로 취급, 그대로 출력
							else {
								return char;
							}

							const id = `ch_${inputCounter}`;
							inputCounter++;
							return `<input id="${id}" class="test-input ${charClass} " type="text" maxlength="1" data-char="${char}"/>`;
						})
						.join("")
				);
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

		// 생성된 input태그들 지정
		const inputs = Array.from(
			this.contentEl.querySelectorAll("input")
		) as HTMLInputElement[];

		// 기능 구현을 위한 이벤트 리스너 추가
		inputs.forEach((input, index) => {
			// 좌/우 화살표, Enter 입력 시 focus 이동
			input.addEventListener("keydown", (event) => {
				const target = event.target as HTMLInputElement;
				if (event.key === "ArrowLeft" && index > 0) {
					inputs[index - 1].focus();
				} else if (
					event.key === "ArrowRight" ||
					event.key === "Enter"
				) {
					if (index < inputs.length - 1) {
						inputs[index + 1].focus();
					}
				}
			});

			// 비어있는 input에서 Backspace를 입력 시, previous input으로 focus이동
			input.addEventListener("keydown", (event) => {
				const target = event.target as HTMLInputElement;
				if (
					event.key === "Backspace" &&
					target.value === "" &&
					index > 0
				) {
					// Backspace로 이동 시, 값이 삭제 방지
					event.preventDefault();
					// focus이동
					inputs[index - 1].focus();
				}
			});

			// 정답 입력 시, next input으로 focus가 이동
			// 입력값의 정답 유무에 따라 스타일링 변경
			input.addEventListener("input", (event) => {
				const target = event.target as HTMLInputElement;
				const answerChar = target.getAttribute("data-char") || "";
				const inputChar = target.value;

				//입력 시, 이전 입력으로부터 생성된 정답 유무 클래스 삭제
				target.removeClasses(["_vld", "_invld"]);

				// 정답 입력 시
				if (inputChar === answerChar) {
					// focus 이동
					if (index < inputs.length - 1) {
						inputs[index + 1].focus();
					}
					target.addClass("_vld");
				}

				// 오답 입력 시
				else {
					target.addClass("_invld");
				}

				// 입력값이 비워졌다면 정답유무 스타일 삭제
				if (target.value === "")
					target.removeClasses(["_vld", "_invld"]);
			});
		});
	}

	onClose() {
		this.component.unload();
	}
}
