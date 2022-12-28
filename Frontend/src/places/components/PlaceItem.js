import React, { useContext, useState} from "react";

import './PlaceItem.css';
import Card from "../../Shared/components/UIElements/Card";
import Button from "../../Shared/components/FormElements/Button";
import Modal from "../../Shared/components/UIElements/Modal";
import Map from "../../Shared/components/UIElements/Map";
import { AuthContext } from "../../Shared/context/auth-context";
import { useHttpClient } from "../../Shared/Hooks/http-hook";
import ErrorModal from "../../Shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/components/UIElements/LoadingSpinner";

const PlaceItem =(props) => {
    const {isLoading,error,sendRequest,clearError} = useHttpClient();
    const auth = useContext(AuthContext);

    const [showMap,setShowMap] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const openMapHandler = () =>{
        setShowMap(true);
    }
    const closeMapHandler = () =>{
        setShowMap(false);
    }

    const showConfirmDeleteHandler = () =>{
        setShowConfirmDelete(true);
    }
    const cancelDeleteHandler = () =>{
        setShowConfirmDelete(false);
    }

    const confirmDeleteHandler = async () =>{
        setShowConfirmDelete(false);
        try{
            await sendRequest(
                `http://localhost:5000/api/places/${props.id}`,
                'DELETE'
            );
            props.onDelete(props.id);
        }catch(err){

        }
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <Modal 
                show={showMap} 
                onCancel={closeMapHandler}
                header = {props.address}
                contentClass = "place-item__modal-content"
                footerClass = "place-item__modal-actions"
                footer = {<Button onClick={closeMapHandler}>Close</Button>} 
            >
                <div className="map-container">
                    <Map center={props.coordinates} zoom={15}/>
                </div>
            </Modal>
            <Modal 
                show = {showConfirmDelete}
                onCancel = {cancelDeleteHandler}
                header='Are You Sure?' 
                footerClass='place-item__modal-actions'
                footer = {
                    <React.Fragment>
                        <Button inverse onClick={cancelDeleteHandler}>Cancel</Button>
                        <Button danger onClick={confirmDeleteHandler}>Delete</Button>
                    </React.Fragment>
                }
            >
                <h2>Do you want to proceed and delete this place. It can't be undone</h2>
            </Modal>
            <li className="place-item">
                <Card className='place-item__content'>
                    {isLoading &&
                        <LoadingSpinner asOverlay />
                    }
                    <div className="place-item__image">
                        <img src={`http://localhost:5000/${props.image}`} alt={props.title} />
                    </div>
                    <div className="place-item__info">
                        <h2>{props.title}</h2>
                        <h3> {props.address} </h3>
                        <p>{props.description}</p>
                    </div>
                    <div className="place-item__actions">
                        <Button inverse onClick={openMapHandler}> View on MAP </Button>
                        {auth.userId ===props.creatorId && (
                            <Button to={`/places/${props.id}`}> Edit </Button>
                        )}
                        {auth.userId ===props.creatorId && (
                            <Button danger onClick={showConfirmDeleteHandler}> Delete </Button>
                        )}
                    </div>
                </Card>
            </li>
        </React.Fragment>
    );
} 

export default PlaceItem;