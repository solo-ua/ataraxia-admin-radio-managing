import React, { useEffect, useState } from 'react';
import SelectionComponent from './selection';

const EditExistingItem = ({ item }) => {
    const [fetchDataCallback, setCallbackFetch] = useState(() => () => {}); // Initialize with a no-op function
    const [title, setTitle] = useState('');
    const [navigate, setNavgiator] = useState('');

    useEffect(() => {
        if (item === 'hosts') {
            setTitle('Radio Hosts');
            setNavgiator('/radio-workspace');
            const callback = async () => {
                const resp = await fetch('http://obesecat.atwebpages.com/radio-services/radioHosts.php');
                const data = await resp.json();
                if (data.hosts.length > 0) {
                    const response = data.hosts.map((host) => ({
                        id: host.idHost,
                        name: host.name,
                        attributes: [
                            { name: 'Hosting Country', value: host.country },
                            { name: 'URL for fetching track info', value: host.fetchTrackInfo },
                            { name: 'Path to track title', value: host.pathTT },
                            { name: 'Path to track artist', value: host.pathTA },
                            { name: 'Path to track album cover', value: host.pathTC },
                        ],
                    }));
                    return response;
                } else {
                    return false; // show that there has been an error
                }
            };
            setCallbackFetch(() => callback);
        } else {
            setTitle('Radio Stations');
            setNavgiator('/station-workspace');
            const callback = async () => {
                const resp = await fetch('http://obesecat.atwebpages.com/radio-services/stations.php');
                const data = await resp.json();
                console.log(data);
                if (data.stations.length > 0) {
                    const response = data.stations.map((station) => ({
                        id: station.idSS,
                        name: station.name,
                        attributes: [
                            { name: 'ID of the radio hosting this station', value: station.idHostedBy },
                            { name: 'Stream URL', value: station.url },
                        ],
                    }));
                    return response;
                } else {
                    return false; // show that there has been an error
                }
            };
            setCallbackFetch(() => callback);
        }
    }, [item]); // Add `item` as a dependency to re-run when `item` changes

    return (
        <SelectionComponent
            title={title}
            fetchDataCallback={fetchDataCallback}
            navigateToNextPage={navigate}
        />
    );
};

export default EditExistingItem;
