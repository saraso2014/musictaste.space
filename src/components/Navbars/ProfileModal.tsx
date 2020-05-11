import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Modal } from 'reactstrap'
import { AuthContext } from '../../contexts/Auth'
import firebase from '../../util/Firebase'

// @ts-ignore
const ProfileModal = (props) => {
  const history = useHistory()
  const { currentUser } = useContext(AuthContext)

  const signOut = () => {
    firebase.app.auth().signOut()
  }

  const toTally = () => history.push('/tally')

  return (
    <Modal
      modalClassName="modal-mini modal-primary"
      isOpen={props.isOpen}
      toggle={props.toggleModal}
    >
      <div className="modal-header justify-content-center">
        <button className="close" onClick={props.toggleModal}>
          <i className="tim-icons icon-simple-remove text-white" />
        </button>
        <div
          className="modal-img-div shadow-lg"
          style={{ backgroundImage: `url(${currentUser.photoURL})` }}
          onClick={toTally}
        />
      </div>
      <div className="modal-body">
        <p>
          <b>{currentUser.displayName}</b>
        </p>
        <p>{currentUser.uid}</p>
      </div>
      <div className="modal-footer">
        <Button
          className="btn-neutral"
          color="link"
          type="button"
          onClick={signOut}
        >
          Sign Out
        </Button>
        <Button
          className="btn-neutral"
          color="link"
          onClick={props.toggleModal}
          type="button"
        >
          Close
        </Button>
      </div>
    </Modal>
  )
}

export default ProfileModal
