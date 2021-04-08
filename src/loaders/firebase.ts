import firebase from "firebase";
import "firebase/database";
import config from "../configs";

let hackernewsApi: firebase.database.Reference;

function loadHackernewsFirebase() {
    var firebaseConfig = {
        databaseURL: config.hackernews.databaseUrl
    };

    const app = firebase.initializeApp(firebaseConfig, "hackernews");
    hackernewsApi = firebase.database(app).ref(config.hackernews.apiVersion);
}

export { loadHackernewsFirebase, hackernewsApi };
