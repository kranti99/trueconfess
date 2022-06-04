import { useState } from 'react';
import { useNavigate } from "react-router-dom";


const Create = () => {
    const[title, setTitle] = useState('');
    const[body, setBody] = useState('');
    const[author, setAuthor] = useState('youshi');
    const[isPending, setIsPending] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const blog = {title,body, author}
        setIsPending(true)
        fetch('http://localhost:8000/blogs', {
            method: 'POST',
            headers: {'content-Type': 'application/json'},
            body: JSON.stringify(blog)                      //obj to json string
        }).then(()=>{
            console.log('new blog added')
            setIsPending(false)
            navigate('/')
        })
    }
    return ( 
    <div className="create">
        <h1>Add A Blog</h1>
        <form onSubmit={handleSubmit}>
            <label>Blog title:</label>
            <input type="text" required value={title} onChange = {(e)=>setTitle(e.target.value)}/>

            <label>Blog Body:</label>
            <textarea required value={body} onChange = {(e)=>setBody(e.target.value)}></textarea>

            <label>Author:</label>
            <select value={author} onChange={(e)=>setAuthor(e.target.value)}>
                <option value="youshi">youshi</option>
                <option value="Adam">Adam</option>
            </select>
            {!isPending && <input type="submit" value="Send" />}
            {isPending && <input type="submit" disabled value="Sending ..." />}

        </form>
    </div> );
}
 
export default Create;