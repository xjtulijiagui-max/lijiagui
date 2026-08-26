const toast = document.querySelector("#toast");
const taskLinks = [...document.querySelectorAll("[data-task-link]")];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
}

async function copyPrompt(button) {
  const target = document.querySelector(`#${button.dataset.copyTarget}`);
  const text = target.textContent.trim();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  button.textContent = "已复制";
  showToast("提示词已复制，可以粘贴到AI工具中");
  window.setTimeout(() => { button.textContent = "复制提示词"; }, 1600);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-copy-target]");
  if (button) copyPrompt(button);
});

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
  if (!visible) return;
  taskLinks.forEach((link) => {
    const active = link.dataset.taskLink === visible.target.id;
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}, { rootMargin: "-20% 0px -65%", threshold: [0.1, 0.35, 0.65] });

document.querySelectorAll("section.task").forEach((section) => observer.observe(section));
