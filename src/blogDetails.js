import { useParams } from "react-router-dom";
import useFetch from './useFetch';
import { useNavigate } from "react-router-dom";

const BlogDetails = () => {
    const {id} = useParams();
    const {blogs, isPending, error } =   useFetch('http://localhost:8000/blogs/'+id);  
    const navigate = useNavigate()
    
    const handleClick = ()=> {
        fetch('http://localhost:8000/blogs/' + blogs.id, {
            method: 'DELETE'
        }).then(()=>{
            navigate('/')
        })
    }
    return ( <div>
        <h1>
            Blog Details -{id}
            { isPending && <p>Loading...</p>}
            { error && <p>{error}</p>}
            
            {
            blogs && 
                (
                    <div>
                    <h1>{blogs.title}</h1>
                    <p>{blogs.author}</p>

                    <p>{blogs.body}</p>

                    <button onClick={handleClick}>Delete</button>
                    </div>
            )}
        </h1>

    </div> );
}
 
export default BlogDetails;