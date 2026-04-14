import Action from './Action.js';
import FileUploadView from './views/FileUploadView.js';

class FileUpload extends Action {

  name = 'FileUpload';

  constructor(data) {
    super(new FileUploadView(data));
  }

}

export default FileUpload;