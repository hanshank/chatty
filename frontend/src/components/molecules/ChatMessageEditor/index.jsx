import React from 'react';
import {Editor, EditorState, RichUtils} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import 'draft-js/dist/Draft.css';
import Button from '../../atoms/Button';

import styles from "./styles.module.css"

class ChatMessageEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = editorState => this.setState({editorState});
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    this?.props?.onSubmit && this.props.onSubmit();
    this.setState({ editorState: EditorState.createEmpty() })
  }

  componentDidUpdate() {
    this.props.onChange(stateToHTML(this.state.editorState.getCurrentContent()));
  }

  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return 'handled';
    }

    return 'not-handled';
  }

  _onBoldClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  }

  _onItalicsClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
  }

  render() {
    return (
      <div className={styles.editor}>
        <div className={styles.toolbar}>
          <button className={styles.toolbarButton} onClick={this._onBoldClick.bind(this)}>B</button>
          <button className={styles.toolbarButton} onClick={this._onItalicsClick.bind(this)}>I</button>
        </div>
        
        <div className={styles.textArea}>
          <Editor
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            placeholder="Enter message text..."
          />
        </div>

        <div className={styles.submitButtonWrapper}>
          <Button
            variation="primary"
            onClick={this.handleSubmit}
          >
            Send
          </Button>
        </div>
      </div>
    );
  }
}

export default ChatMessageEditor