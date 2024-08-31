import React from "react";
import '../styles/user.css';

const userList = [
    {
        id: 1,
        name: 'Kasun',
        address: 'No:278, VI Drive, Temple Place',
        country: 'Sri Lanka'
    },
    {
        id: 2,
        name: 'John',
        address: '123 Main Street',
        country: 'United States'
    },
    {
        id: 3,
        name: 'Emma',
        address: '45 Park Avenue',
        country: 'United Kingdom'
    },
    {
        id: 4,
        name: 'Carlos',
        address: 'Av. Libertador 123',
        country: 'Argentina'
    },
    {
        id: 5,
        name: 'Lina',
        address: 'Rue de la Paix 56',
        country: 'France'
    }
];

const User = () => {
    return (
        <>
            <h2>Users List</h2>
            <div className="user-list">
                {userList.map((user, index) => // Repeat list items using the map function
                    <div key={`user-${index}`} className="user-list__item">
                        <div className="user-list__name">Name: {user.name}</div>
                        <div className="user-list__address">Address: {user.address}</div>
                        <div className="user-list__country">Country: {user.country}</div>
                    </div>
                )}
            </div>
        </>
    );
}

export default User;