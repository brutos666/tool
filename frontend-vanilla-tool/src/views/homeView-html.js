function getHtmlView() {
  return String.raw`
    <header class="header">
      <div class="header-content">
        <h3>Tâches</h3>
      </div>
    </header>
    <div class="row">
      <div class="col">
        <label for="input">HTML</label>
        <textarea cols="100" rows=10 id="input" name="input" ></textarea>
      </div>
    </div>
    <div class="row">
      <button id="task-button">Tâche du jour</button>
    </div>`;
}

export default getHtmlView;
