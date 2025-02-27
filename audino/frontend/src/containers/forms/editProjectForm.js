import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { withStore } from '@spyna/react-store';
import { errorLogger } from '../../logger';
import { FormAlerts } from '../../components/alert';
import { Button } from '../../components/button';

class EditProjectForm extends React.Component {
  constructor(props) {
    super(props);
    const { projectId } = this.props;
    this.initialState = {
      name: '',
      errorMessage: '',
      successMessage: '',
      isSubmitting: false,
      url: `/api/projects/${projectId}`,
      isMarkedExample: false,
      isIOU: false,
      maxUsers: 10,
      conThres: 75,
    };

    this.state = { ...this.initialState };
  }

  componentDidMount() {
    const { url } = this.state;
    axios({
      method: 'get',
      url
    })
      .then(response => {
        if (response.status === 200) {
          const { name, is_example, isIOU, max_users, threshold } = response.data;
          console.log(isIOU)
          this.setState({ name, isMarkedExample: is_example, isIOU: isIOU, maxUsers: max_users, conThres: threshold * 100});
        }
      })
      .catch(error => {
        errorLogger.sendLog(error.response.data.message);
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: null
        });
      });
  }

  handleProjectNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleMarkedExampleChange() {
    const { isMarkedExample } = this.state;
    if (isMarkedExample) {
      this.setState({ isMarkedExample: false });
    } else {
      this.setState({ isMarkedExample: true });
    }
  }

  handleQualityControl() {
    const { isIOU } = this.state;
    if (isIOU) {
      this.setState({ isIOU: false });
    } else {
      this.setState({ isIOU: true });
    }
  }

  handleMaxUsers(e) {
    let value = e.target.value
    this.setState({ maxUsers: value });
  }

  handleConThresh(e) {
    let value = e.target.value
    if (value > 100) {
      value = 100
    } 
    this.setState({ conThres: value });
  }

  handleProjectCreation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });
    let {  conThres, maxUsers } = this.state;
    const { name, url, isMarkedExample, isIOU, } = this.state;
    
    if (conThres < 1) conThres = 1
    if (maxUsers < 1) maxUsers = 1
    
    axios({
      method: 'patch',
      url,
      data: {
        name,conThres, maxUsers ,
        is_example: isMarkedExample,
        isIOU: isIOU,
        
      }
    })
      .then(response => {
        this.setState({ successMessage: response.data.message, isSubmitting: false });
        // TODO: Decide if addition response is needed
        /* if (response.status === 200) {
          this.resetState();
          this.form.reset();
          this.setState({ successMessage: 'Successfully changed name' });
        } */
      })
      .catch(error => {
        errorLogger.sendLog(error.response.data.message);
        console.error(error.response);
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: '',
          isSubmitting: false
        });
      });
  }

  handleEnter(e) {
    if (e.key === 'Enter') {
      this.handleProjectCreation(e);
    }
  }

  resetState() {
    this.setState(this.initialState);
  }

  render() {
    const { isSubmitting, errorMessage, successMessage, isMarkedExample, name, isIOU, maxUsers, conThres } = this.state;
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
            name="new_project"
            ref={el => {
              this.form = el;
            }}
          >
            <FormAlerts
              errorMessage={errorMessage}
              successMessage={successMessage}
              callback={e => this.handleAlertDismiss(e)}
            />
            <div className="form-group text-left">
              <input
                type="text"
                className="form-control"
                id="project_name"
                placeholder={name}
                autoFocus
                required
                onChange={e => this.handleProjectNameChange(e)}
                onKeyDown={e => this.handleEnter(e)}
              />
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="isExample"
                value
                checked={isMarkedExample}
                onChange={() => this.handleMarkedExampleChange()}
                // disabled={isMarkedForReviewLoading}
              />
              <label className="form-check-label" htmlFor="isMarkedForReview">
                Mark is Example Project
              </label>
              </div>
              <div>
              <input
                className="form-check-input"
                type="checkbox"
                id="isExample"
                value
                checked={isIOU}
                onChange={() => this.handleQualityControl()}
                // disabled={isMarkedForReviewLoading}
              />
              <label className="form-check-label" htmlFor="isMarkedForReview">
                Enable experimental quality control?
              </label>
            </div>
            <div>
            <label for="MaxUsers">Max users for quality control</label>
            <input type="number" id="MaxUsers" name="MaxUsers" min="1" value={maxUsers} onChange={e => this.handleMaxUsers(e)}/>
            </div>

            <div>
            <label for="conThresh">Confidence Threshold</label>
            <input type="number" id="conThresh" name="conThresh" min="1" max="100" value={conThres} onChange={e => this.handleConThresh(e)}/>
            </div>
            <div className="form-row">
              <div className="form-group col">
                <Button
                  size="lg"
                  type="primary"
                  disabled={!!isSubmitting}
                  onClick={e => this.handleProjectCreation(e)}
                  isSubmitting={isSubmitting}
                  text="Save"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(EditProjectForm));
