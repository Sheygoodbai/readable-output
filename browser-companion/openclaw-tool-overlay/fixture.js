(function () {
  const markdown = document.querySelector("#fixture-markdown");
  const sidebar = document.querySelector("#fixture-sidebar");
  const closeButton = document.querySelector("#close-sidebar");
  const widthButton = document.querySelector("#toggle-width");

  const samples = {
    zh: [
      "<p>从执行层面看，这个方案并不是不能落地，但目前最大的风险不是实现难度，而是这段总结把不确定的地方写得太像已经完成了。</p>",
      "<p>我们还没有验证输出文件是否真的存在，也没有确认配置是否已经随部署发布，更没有重跑集成测试去排除回归风险。如果现在直接把任务关掉，后面返工概率很高。</p>",
      "<p>建议先做三件事：检查产物路径、重跑测试、确认配置实际生效。</p>",
    ].join(""),
    en: [
      "<p>This looks close, but the wording is more confident than the evidence. We still have not verified the generated file, confirmed the deployment includes the new config, or rerun the integration suite after the last change.</p>",
      "<p>If someone skims this, they may close the task too early. The safer next move is to verify the file path, rerun the test, and confirm the deployment really shipped the setting.</p>",
    ].join(""),
    json: [
      "<p>The command returned a dense payload and a stale key reference. Before shipping, verify the env name and rerun the deploy smoke test.</p>",
      "<pre>{\n  \"status\": \"partial\",\n  \"generatedFile\": null,\n  \"envKey\": \"APP_RUNTIME_MODE\",\n  \"expectedEnvKey\": \"APP_EXECUTION_MODE\",\n  \"warnings\": [\n    \"artifact missing\",\n    \"config not verified\",\n    \"deployment smoke test not rerun\"\n  ]\n}</pre>",
    ].join(""),
  };

  function setSample(key) {
    markdown.innerHTML = samples[key] || samples.zh;
  }

  document.querySelectorAll("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      setSample(button.dataset.sample || "zh");
    });
  });

  widthButton.addEventListener("click", () => {
    sidebar.classList.toggle("is-narrow");
  });

  closeButton.addEventListener("click", () => {
    sidebar.style.display = "none";
    window.setTimeout(() => {
      sidebar.style.display = "flex";
    }, 900);
  });

  setSample("zh");
})();
