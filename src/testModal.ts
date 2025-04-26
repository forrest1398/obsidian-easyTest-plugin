import { App, Modal, MarkdownRenderer, Component } from "obsidian";
import { EasyTestSettings } from "./settings";

export class TestModal extends Modal {
	component: Component;
	content: string;
	title: string;
	activatedInputIndex: number;
	settings: EasyTestSettings;

	constructor(
		app: App,
		title: any,
		content: any,
		settings: EasyTestSettings
	) {
		super(app);
		this.content = content;
		this.component = new Component();
		this.title = title;
		this.activatedInputIndex = 0;
		this.settings = settings;

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

							// 종류별 input 색상
							let borderColor = "";
							let backgroundColor = "";

							if (/^[a-zA-Z]$/.test(char)) {
								charClass = "en";
								borderColor = this.settings.enColor;
								backgroundColor =
									this.settings.enBackgroundColor;
							} else if (/^[0-9]$/.test(char)) {
								charClass = "num";
								borderColor = this.settings.numColor;
								backgroundColor =
									this.settings.numBackgroundColor;
							} else if (/^[ㄱ-힣]$/.test(char)) {
								charClass = "ko";
								borderColor = this.settings.koColor;
								backgroundColor =
									this.settings.koBackgroundColor;
							} else if (
								/^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]$/u.test(
									char
								)
							) {
								charClass = "ja";
								borderColor = this.settings.jaColor;
								backgroundColor =
									this.settings.jaBackgroundColor;
							}

							// 띄어쓰기는 input이 아닌 span태그로 변환
							else if (char === " ") {
								return `<span style="display: inline-block; width: 10px;"></span>`;
							}
							// 이외 글자는 특수문자로 취급, 그대로 출력
							else {
								return char;
							}
							console.log(borderColor);
							console.log(backgroundColor);

							const id = `ch_${inputCounter}`;
							inputCounter++;
							return `<input 
							id="${id}" 
							class="test-input ${charClass} " 
							style="border-color:${borderColor}; background-color:${backgroundColor}" 
							data-char="${char}"
							type="text" maxlength="1"/>`;
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
			this.contentEl.querySelectorAll("input.test-input")
		) as HTMLInputElement[];

		// input에 이벤트 리스너 추가
		inputs.forEach((input, index) => {
			// focus 이동 시, 이동 전 input의 hint-target 클래스 제거 + activatedInputIndex 업데이트
			input.addEventListener("focus", () => {
				const activatedInput = inputs[this.activatedInputIndex];
				activatedInput.removeClass("hint-target");
				this.activatedInputIndex = index;
			});

			// 좌/우 화살표, Enter 입력 시 focus 이동
			input.addEventListener("keydown", (event) => {
				const target = event.target as HTMLInputElement;
				if (event.key === "ArrowLeft" && index > 0) {
					this.moveFocusFoward(inputs, index);
				} else if (
					event.key === "ArrowRight" ||
					event.key === "Enter"
				) {
					if (index < inputs.length - 1) {
						this.moveFocusBackward(inputs, index);
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
					this.moveFocusFoward(inputs, index);
				}
			});

			// 정답 입력 시, next input으로 focus가 이동
			// 입력값의 정답 유무에 따라 스타일링 변경
			input.addEventListener("input", (event) => {
				const target = event.target as HTMLInputElement;
				const answerChar = target.getAttribute("data-char") || "";
				const inputChar = target.value;

				//입력 시, 이전 입력으로부터 생성된 정답 유무 클래스 삭제
				target.removeClasses(["_vld", "_invld", "_hint-used"]);

				// 정답 입력 시
				if (inputChar === answerChar) {
					// focus 이동
					if (index < inputs.length - 1) {
						this.moveFocusBackward(inputs, index);
					}
					target.addClass("_vld");
				}

				// 오답 입력 시
				else {
					target.addClass("_invld");
				}

				// 입력값이 비워졌다면 정답유무 스타일 삭제
				if (target.value === "")
					target.removeClasses(["_vld", "_invld", "_hint-used"]);
			});
		});

		// 힌트 버튼 추가
		const hintButton = this.modalEl.createEl("button");
		hintButton.appendText("Hint");
		hintButton.classList.add("hint-button");

		// 힌트 버튼 반응형 위치 구현
		const updateButtonPosition = () => {
			const modalRect = this.modalEl.getBoundingClientRect();
			const containerRect = this.containerEl.getBoundingClientRect();
			const buttonPositionX =
				containerRect.width / 2 + modalRect.width / 2 - 75;
			const buttonPositionY = modalRect.top + 10;
			hintButton.style.left = `${buttonPositionX}px`;
			hintButton.style.top = `${buttonPositionY}px`;
		};

		updateButtonPosition();

		const resizeObserver = new ResizeObserver(() => {
			updateButtonPosition();
		});
		resizeObserver.observe(this.containerEl);

		// hint 버튼 대상 표시 기능
		hintButton.addEventListener("mouseover", () => {
			const activatedInput = inputs[this.activatedInputIndex];
			activatedInput.addClass("hint-target");
		});

		hintButton.addEventListener("mouseout", () => {
			const activatedInput = inputs[this.activatedInputIndex];
			activatedInput.removeClass("hint-target");
		});

		// hint 버튼 정답 입력 기능
		hintButton.addEventListener("click", () => {
			let activatedInput = inputs[this.activatedInputIndex];

			// 정답 입력 및 스타일 적용
			const charValue = activatedInput.getAttribute("data-char");
			if (charValue !== null) {
				activatedInput.value = charValue;
			} else {
				activatedInput.value = "";
			}

			activatedInput.addClass("_hint-used");

			// 정답 입력 후 이동된 input에게도 hint 스타일 적용
			this.moveFocusBackward(inputs, this.activatedInputIndex);
			activatedInput = inputs[this.activatedInputIndex];
			activatedInput.addClass("hint-target");
		});
	}

	moveFocusFoward(inputs: HTMLInputElement[], index: number) {
		const activatedInput = inputs[index];
		activatedInput.removeClass("hint-target");

		// 0 이상의 인덱스 중에서
		while (index > 0) {
			// 한칸씩 옮겨가며
			index -= 1;
			// _vld가 없는 html element를 찾는다.
			if (!inputs[index].classList.contains("_vld")) {
				inputs[index].focus();
				break;
			}
		}
	}

	moveFocusBackward(inputs: HTMLInputElement[], index: number) {
		const activatedInput = inputs[index];
		activatedInput.removeClass("hint-target");

		// 배열의 길이 이하의 인덱스 중에서
		while (index < inputs.length - 1) {
			// 한칸씩 옮겨가며
			index += 1;
			// _vld가 없는 html element를 찾는다.
			if (!inputs[index].classList.contains("_vld")) {
				inputs[index].focus();
				break;
			}
		}
	}
	onClose() {
		this.component.unload();
	}
}
