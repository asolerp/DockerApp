import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default () => {

    const [ loading, setLoading ] = useState(false)

    const handleButton = async () => {
        setLoading(true)
        try {
            await axios.get('/api/values/clear')
            setLoading(false)
        } catch(e) {
            console.log(e)
        }
    }

    return (
        <div>
            Im some other page!
            <Link to="/">Go back home</Link>
            <button onClick={handleButton}>
                Delete all records
            </button>
            {loading && <p>Borrando...</p>}
        </div>
    )
}