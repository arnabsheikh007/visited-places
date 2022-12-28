import react from "react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ErrorModal from "../../Shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../Shared/Hooks/http-hook";

import PlaceList from "../components/PlaceList";


const UserPlaces = (props) => {
    const [loadedPlaces,setLoadedPlaces] = useState();
    const {isLoading,error,sendRequest,clearError} = useHttpClient();
   
    const userId = useParams().userId;

    useEffect(() => {
        const fetchPlaces = async () =>{
            try{
                const responseData = await sendRequest(`http://localhost:5000/api/places/user/${userId}`);
                setLoadedPlaces(responseData.places)
            }catch(err){

            }
        }
        fetchPlaces();
    },[sendRequest,userId]);

    const placeDeletedHandler = (deletedPlaceId) =>{
        console.log('deleted place id: ',deletedPlaceId);
        setLoadedPlaces(prevPlaces => prevPlaces.filter(p => p.id !== deletedPlaceId))
    } 

    return (
        <react.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading &&
                <div className="center">
                    <LoadingSpinner />
                </div>
            }
            {!isLoading && loadedPlaces &&
                <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler}/>
            }
        </react.Fragment>
    );
}

export default UserPlaces;