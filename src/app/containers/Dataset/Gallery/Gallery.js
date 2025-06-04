import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getGallery } from "../../../services/Dataset/index";
import { BASE_URL } from "../../../../constants/BASE_URL";

const Gallery = (props) => { 
    const { id } = props.match.params;
    // const id_folder = props.location.aboutProps.id_folder
    // const [datasets, setDatasets] = useState({
    //     dataRes: [],
    //     currentPage: 1,
    //     pageSize: 24,
    //     totalDocs: 0,
    //     query: { datasetId: id },
    // });






    const handleGetFile = async () => {
       const response = await getGallery(id);
       if (response) {
        console.log("Gallery response", response);
        const imgUrl = `${BASE_URL}/${response.datasetId?.datasetPath}/${response.imageName}`;
        console.log("Image URL", imgUrl);
        //  setData(response);
       }
    };

    handleGetFile();

    console.log("Gallery props", props);
    return (
        <div className="gallery">
        <h1>Gallery</h1>

        <p>This is the Gallery component.</p>
        </div>
    );
}    

function mapStateToProps(store) {
  const { myInfo } = store.user;
  return { myInfo };
}

export default connect(mapStateToProps, null)(Gallery);

