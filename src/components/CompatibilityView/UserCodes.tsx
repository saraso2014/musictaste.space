import copy from 'copy-to-clipboard'
import React, { useContext, useState } from 'react'
import GoogleAnalytics from 'react-ga'
import Switch from 'react-switch'
import { useToasts } from 'react-toast-notifications'
import {
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
  UncontrolledTooltip,
} from 'reactstrap'
import { AuthContext } from '../../contexts/Auth'
import { UserDataContext } from '../../contexts/UserData'

function UserCodes() {
  const { currentUser } = useContext(AuthContext)
  const { userData } = useContext(UserDataContext)
  const [anonIDDisplay, setAnonIDDisplay] = useState(false)
  const { addToast } = useToasts()

  const copyIdToClipboard = (e: any) => {
    if (!userData) {
      return false
    }
    GoogleAnalytics.event({
      category: 'Interaction',
      label: 'Copy Code',
      action: 'Copied match ID to clipboard',
    })
    addToast(
      `Copied your ${
        anonIDDisplay ? 'anonymous' : ''
      } match code to clipboard. ${
        !anonIDDisplay
          ? 'Share it with your friends!'
          : 'Share it with strangers!'
      }`,
      {
        appearance: 'info',
        autoDismiss: true,
      }
    )
    document
      .getElementsByClassName('id-copy-icon')[0]
      .classList.remove('animated', 'tada')
    anonIDDisplay ? copy(userData.anonMatchCode) : copy(userData.matchCode)
    document
      .getElementsByClassName('id-copy-icon')[0]
      .classList.add('animated', 'tada')
  }

  const copyUrlToClipboard = () => {
    if (!userData) {
      return false
    }
    GoogleAnalytics.event({
      category: 'Interaction',
      label: 'Copy Code',
      action: 'Copied match URL to clipboard',
    })
    addToast(
      `Copied your ${
        anonIDDisplay ? 'anonymous' : ''
      } match URL to clipboard. ${
        !anonIDDisplay
          ? 'Share it with your friends!'
          : 'Share it with strangers!'
      }`,
      {
        appearance: 'info',
        autoDismiss: true,
      }
    )
    document
      .getElementsByClassName('url-copy-icon')[0]
      .classList.remove('animated', 'tada')
    copy(
      (process.env.REACT_APP_MATCH_URL_BASE as string) +
        '/match?request=' +
        (anonIDDisplay ? userData.anonMatchCode : userData.matchCode)
    )
    document
      .getElementsByClassName('url-copy-icon')[0]
      .classList.add('animated', 'tada')
  }

  const doNothing = () => {}

  return (
    <>
      <div className="user-code-area">
        <Row className="row-grid text-left">
          <Col lg="1" md="1" className="d-none d-lg-block" />
          <Col lg="4" md="4" className="profile-col">
            {currentUser ? (
              <div
                className="profile-img-div shadow-lg"
                style={{ backgroundImage: `url(${currentUser.photoURL})` }}
              />
            ) : (
              <></>
            )}
          </Col>
          <Col lg="1" md="1" className="d-block d-lg-none" />
          <Col lg="7" md="7" className="profile">
            <p>Send a friend your URL:</p>
            <InputGroup className="url-container">
              {userData ? (
                <Input
                  type="text"
                  className="url input-border"
                  value={
                    userData.spotifyID
                      ? process.env.REACT_APP_MATCH_URL_BASE +
                        '/match?request=' +
                        (anonIDDisplay
                          ? userData.anonMatchCode
                          : userData.matchCode)
                      : ''
                  }
                  onChange={doNothing}
                />
              ) : null}

              <InputGroupAddon addonType="append">
                <InputGroupText className="input-border input-group-append">
                  <i
                    className="far fa-copy url-copy-icon"
                    onClick={copyUrlToClipboard}
                  />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <p>Or share your code:</p>
            <div className="anon-id-row">
              <InputGroup
                className={
                  'anon-id-container' + (anonIDDisplay ? ' incognito' : '')
                }
              >
                <Input
                  type="text"
                  className={
                    'anon-id input-border' + (anonIDDisplay ? ' incognito' : '')
                  }
                  value={
                    userData && userData.matchCode
                      ? !anonIDDisplay
                        ? userData.matchCode
                        : userData.anonMatchCode
                      : ''
                  }
                  onChange={doNothing}
                />
                <InputGroupAddon addonType="append">
                  {anonIDDisplay ? (
                    <>
                      <InputGroupText className="input-border input-group-append">
                        <i
                          id="anonymous-icon"
                          className="fas fa-user-secret incognito id-anonymous-icon"
                        />
                      </InputGroupText>
                      <UncontrolledTooltip
                        placement="bottom"
                        target="anonymous-icon"
                        delay={0}
                      >
                        Your profile is kept anonymous.
                      </UncontrolledTooltip>
                    </>
                  ) : (
                    <></>
                  )}
                  <InputGroupText className="input-border input-group-append">
                    <i
                      className={
                        'far fa-copy url-copy-icon id-copy-icon' +
                        (anonIDDisplay ? ' incognito' : '')
                      }
                      onClick={copyIdToClipboard}
                    />
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <div className="switch-box">
                <i
                  id="anonymous-icon"
                  className="fas fa-user-secret id-anonymous-icon dark"
                />
                <Switch
                  checked={anonIDDisplay}
                  onChange={setAnonIDDisplay}
                  onColor="#3c6382"
                  onHandleColor="#2c3e50"
                  handleDiameter={30}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                  height={20}
                  width={48}
                  className="react-switch"
                  id="material-switch"
                />
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '1em' }}>
              {!anonIDDisplay ? (
                <em>
                  Your name and profile photo will be shared using this code.
                </em>
              ) : (
                <em>
                  Your name and profile photo will be <strong>HIDDEN</strong>{' '}
                  using this code.
                </em>
              )}
            </p>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default UserCodes
