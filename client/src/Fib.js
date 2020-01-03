import React, {useState, useEffect} from 'react'
import axios from 'axios'

export default function Fib () {

    const [ seenIndexes, setSeenIndexes ] = useState([])
    const [ values, setValues ] = useState({})
    const [ index, setIndex ] = useState('')

    useEffect(() => {

        const fetchValues = async () => {
            const vals = await axios.get('/api/values/current')
            setValues(vals.data)
        }
    
        const fetchIndexes = async () => {
            const indexes = await axios.get('/api/values/all')
            setSeenIndexes(indexes.data)
        }

        fetchValues()
        fetchIndexes()
        
    }, [])


    const renderSeenIndexes = () => (
        seenIndexes.map(({ number }) => number).join(', ')
    )

    const renderValues = () => {
        const entries = []
        
        for (let key in values) {
            entries.push(
                <div key={key}>
                    For index { key } I calculated { values[key] }
                </div>
            )
        }

        return entries
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        await axios.post('/api/values', {
            index
        })

        setIndex('')
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Enter your index</label>
                <input
                value={index}
                onChange={event => setIndex(event.target.value)}
                ></input>
                <button>Submit</button>
            </form>
            <h3>Indexes I have seen: </h3>
            {seenIndexes && renderSeenIndexes()}
            <h3>Calculeted values: </h3>
            {renderValues()}
        </div>
    )
}