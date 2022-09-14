import React from 'react';

import { ReactComponent as Add } from '../../assets/svg/plus-circle.svg';
import { ReactComponent as ServerIcon } from '../../assets/svg/server.svg';
import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';
import Modal from '../../components/Modal';
import Api from '../../data/Api';

const makeRadarr = (instance) => {
  const defaults = {
    id: '',
    name: 'Server',
    protocol: 'http',
    host: 'localhost',
    port: 7878,
    subpath: '/',
    token: '',
    profile: {
      id: 0,
      name: '',
    },
    path: {
      id: 0,
      location: '',
    },
    language: {
      id: 0,
      name: '',
    },
    availability: {
      id: 0,
      name: '',
    },
    enabled: false,
    profiles: [],
    paths: [],
    languages: [],
    availabilities: [],
  };
  return { ...defaults, ...instance };
};

class Radarr extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      servers: [],
      newInstance: makeRadarr(),
      loading: true,
      isError: false,
      isMsg: false,
      wizardOpen: false,
      activeServer: 0,
      needsSave: true,
    };

    this.inputChange = this.inputChange.bind(this);
    this.getRadarr = this.getRadarr.bind(this);
    this.saveServer = this.saveServer.bind(this);
    this.deleteServer = this.deleteServer.bind(this);
    this.openWizard = this.openWizard.bind(this);
    this.closeWizard = this.closeWizard.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.closeMsg = false;
  }

  async saveServer() {
    let server = {};
    if (this.state.needsSave) {
      server = this.state.newInstance;
    } else {
      server = this.state.servers[this.state.activeServer];
    }

    if (server.name === "") {
      this.props.msg({
        message: "name field must not be empty",
        type: 'error',
      });
      return;
    }

    if (server.host === "") {
      this.props.msg({
        message: "host field must not be empty",
        type: 'error',
      });
      return;
    }

    if (server.port === "") {
      this.props.msg({
        message: "port field must not be empty",
        type: 'error',
      });
      return;
    }

    if (server.subpath === "") {
      this.props.msg({
        message: "url base field must not be empty",
        type: 'error',
      });
      return;
    }

    if (server.token === "") {
      this.props.msg({
        message: "token field must not be empty",
        type: 'error',
      });
      return;
    }

    try {
      const result = await Api.saveRadarrConfig([server]);
      if (result.status === "error") {
        this.props.msg({
          message: "failed to save request",
          type: 'error',
        });
        return;
      }

      let index = this.state.activeServer;
      if (this.state.needsSave) {
        index = this.state.servers.push(result[0]);
        index -= 1;
      } else {
        this.state.servers[index] = result[0];
      }

      this.setState({
        needsSave: false,
        activeServer: index,
        newInstance: makeRadarr(),
      });

      this.props.msg({
        message: 'Radarr settings saved!',
        type: 'good',
      });
    } catch (e) {
      this.props.msg({
        message: e.message,
        type: 'error',
      });
    }
  }

  async deleteServer() {
    const id = this.state.activeServer;
    let servers = this.state.servers;
    let res = await Api.radarrDeleteInstance(servers[id].id);
    if (res.status === 'error') {
      this.props.msg({
        message: res.error,
        type: 'error',
      });
      return;
    }

    this.state.servers.splice(id, 1);

    this.closeModal('addServer');
    this.closeWizard();

    this.props.msg({
      message: res.message,
      type: 'good',
    });
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    let server = {};
    if (this.state.needsSave) {
      server = this.state.newInstance;
    } else {
      server = this.state.servers[this.state.activeServer];
    }

    if (target.type === 'checkbox') {
      value = target.checked;
    }

    if (target.type === 'select-one') {
      let title = target.options[target.selectedIndex].text;
      switch (name) {
        case "protocol": {
          server.protocol = value;
          break;
        }
        case "profile": {
          server.profile = {
            id: parseInt(value),
            name: title,
          };
          break;
        }
        case "path": {
          server.path = {
            id: parseInt(value),
            location: title,
          };
          break;
        }
        case "language": {
          server.language = {
            id: parseInt(value),
            name: title,
          };
          break;
        }
        case "availability": {
          server.availability = {
            id: parseInt(value),
            name: title,
          };
        }
      }
    } else {
      server = {
        ...server,
        [name]: name === "port" ? parseInt(value) : value,
      };
    }

    if (this.state.needsSave) {
      this.setState({
        newInstance: server,
      });
    } else {
      const servers = this.state.servers;
      servers[this.state.activeServer] = server;
      this.setState({
        servers,
      });
    }
  }

  async getRadarr(live = false) {
    this.setState({
      loading: live ? false : true,
    });
    try {
      const servers = await Api.radarrConfig(true);
      this.setState({
        servers,
        loading: false,
      });
    } catch (err) {
      this.setState({
        loading: false,
      });
    }
  }

  componentDidMount() {
    this.getRadarr();
  }

  componentWillUnmount() {
    clearInterval(this.closeMsg);
  }

  openWizard(id) {
    if (this.state.servers[id]) {
      this.setState({
        newServer: false,
        editWizardOpen: true,
        activeServer: id,
        needsSave: false,
      });
    } else {
      this.setState({
        newInstance: makeRadarr(),
        newServer: true,
        wizardOpen: true,
        activeServer: id,
        needsSave: true,
      });
    }
  }

  closeWizard() {
    this.setState({
      wizardOpen: false,
      editWizardOpen: false,
      activeServer: 0,
      newServer: false,
    });
  }

  openModal(id) {
    this.setState({
      [`${id}Open`]: true,
    });
  }

  closeModal(id) {
    this.setState({
      [`${id}Open`]: false,
      wizardOpen: false,
      editWizardOpen: false,
      activeServer: 0,
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <>
          <div className="spinner--settings">
            <Spinner />
          </div>
        </>
      );
    }

    let server = {};
    if (this.state.needsSave) {
      server = this.state.newInstance;
    } else {
      server = this.state.servers[this.state.activeServer];
    }

    return (
      <>
        <Modal
          title="Add new server"
          open={this.state.addServerOpen}
          submitText="Save"
          closeText="Close"
          submit={() => this.saveServer()}
          close={() => this.closeModal('addServer')}
          delete={
            this.state.needsSave
              ? false
              : () => {
                this.deleteServer();
                this.closeModal('addServer');
              }
          }
        >
          <label>Name</label>
          <input
            className="styled-input--input"
            type="text"
            name="name"
            value={server?.name}
            onChange={this.inputChange}
          />
          <label>Protocol</label>
          <div className="styled-input--select">
            <select
              name="protocol"
              value={server?.protocol}
              onChange={this.inputChange}
              className="frt"
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
            </select>
          </div>
          <label>Host</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="host"
            value={server?.host}
            onChange={this.inputChange}
          />
          <label>Port</label>
          <input
            className="styled-input--input frt"
            type="number"
            name="port"
            value={server?.port}
            onChange={this.inputChange}
          />
          <label>URL Base</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="subpath"
            value={server?.subpath}
            onChange={this.inputChange}
          />
          <label>Token</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="token"
            value={server?.token}
            onChange={this.inputChange}
          />
          {!this.state.needsSave ? (
            <>
              <label>Profile</label>
              <div
                className={`styled-input--select ${server?.profiles ? '' : 'disabled'}`}
              >
                <select
                  name="profile"
                  value={server?.profile.id}
                  onChange={this.inputChange}
                >
                  {server?.profiles ? (
                    <>
                      <option value="">Choose an option</option>
                      {server?.profiles.map((item) => {
                        return (
                          <option key={`p__${item.id}`} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <option value="">
                      {'Loading...'}
                    </option>
                  )}
                </select>
              </div>
            </>)
            : <></>}
          {!this.state.needsSave ? (
            <>
              <label>Path</label>
              <div
                className={`styled-input--select ${server?.paths ? '' : 'disabled'
                  }`}
              >
                <select
                  name="path"
                  value={server?.path.id || 0}
                  onChange={this.inputChange}
                >
                  {server?.paths ? (
                    <>
                      <option value="">Choose an option</option>
                      {server.paths.map((item) => {
                        return (
                          <option key={`pp__${item.id}`} value={item.id}>
                            {item.path}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <option value="">
                      {'Loading...'}
                    </option>
                  )}
                </select>
              </div>
            </>
          ) : false}
          {!this.state.needsSave ? (
            <>
              <label>Language</label>
              <div
                className={`styled-input--select ${server?.languages ? '' : 'disabled'
                  }`}
              >
                <select
                  name="language"
                  value={server?.language.id || 0}
                  onChange={this.inputChange}
                >
                  {server?.languages ? (
                    <>
                      <option value="">Choose an option</option>
                      {server.languages.map((item) => {
                        return (
                          <option key={`lp__${item.id}`} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <option value="">
                      {'Loading...'}
                    </option>
                  )}
                </select>
              </div>
            </>
          ) : <></>}
          {!this.state.needsSave ? (
            <>
              <label>Minimum Availability</label>
              <div
                className={`styled-input--select ${server?.availability ? '' : 'disabled'
                  }`}
              >
                <select
                  name="availability"
                  value={server?.availability.id || 0}
                  onChange={this.inputChange}
                >
                  {server?.availabilities ? (
                    <>
                      <option value="">Choose an option</option>
                      {server.availabilities.map((item) => {
                        return (
                          <option key={`avl__${item.id}`} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <option value="">
                      {'Loading...'}
                    </option>
                  )}
                </select>
              </div>
            </>
          ) : <></>}
          {!this.state.needsSave ? (
            <div className="checkbox-wrap mb--2">
              <input
                type="checkbox"
                name="enabled"
                checked={server?.enabled}
                onChange={this.inputChange}
              />
              <p>Enabled</p>
            </div>
          ) : null}
        </Modal>
        <section>
          <p className="main-title mb--2">FRICK YOU</p>
          <p className="description">
            Radarr is a DVR. It can monitor multiple RSS feeds for new movies
            and will grab, sort, and rename them.
          </p>
        </section>
        <section>
          <p className="main-title mb--2">Servers</p>
          <div className="sr--grid">
            {this.state.servers.map((server, i) => {
              return (
                <div key={i} className="sr--instance">
                  <div className="sr--instance--inner">
                    <ServerIcon />
                    <p className="sr--title">{server.name}</p>
                    <p>{`${server.protocol}://${server.host}:${server.port}`}</p>
                    <p>Status: {server.enabled ? 'Enabled' : 'Disabled'}</p>
                    <p>Profile: {server.profile.name ?? 'Not set'}</p>
                    <p>Path: {server.path.location ?? 'Not set'}</p>
                    <p>Language: {server.language.name ?? 'Not set'}</p>
                    <p>
                      Minimum Availability:{' '}
                      {server.availability.name ?? 'Not set'}
                    </p>
                    <p className="small">
                      ID: {server.id ? server.id : 'Error'}
                    </p>
                    <div className="btn-wrap">
                      <button
                        className="btn btn__square"
                        onClick={() => {
                          this.openModal('addServer');
                          this.openWizard(i);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="sr--instance sr--add-new">
              <div
                className="sr--instance--inner"
                onClick={() => {
                  this.openModal('addServer');
                  this.openWizard(this.state.servers.length || 0);
                }}
              >
                <p className="sr--title">Add new</p>
                <Add />
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}

export default Radarr;
