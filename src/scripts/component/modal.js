import 'bootstrap/js/dist/modal';

export default class Modal {
  constructor(type, title, msg) {
    let element = document.createElement("div");
    element.className = 'modal';
    element.role = 'dialog';
    element.tabIndex = -1;

    this.type = type;
    this.title = title;
    this.msg = msg;
    this.element = element;
  }

  get() {
    return this.element;
  }

  create() {
    let template = this.element;
    template.innerHTML = `
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${this.title}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>${this.msg}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            ${this.type !== 'alert' ? `<button type="button" class="btn btn-primary">Save changes</button>` : ``}
          </div>
        </div>
      </div>`;
    return template;
  }

  remove() {
    $(this.get()).modal('show');
    setTimeout(() => {
      this.element.remove();
    }, 300)
  }

  render() {
    this.element = this.create();
    document.body.appendChild(this.element);
  }

  show() {
    this.render();
    $(this.get()).modal('show');
  }
}
