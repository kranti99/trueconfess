import BlogList from './BlogList'
import useFetch from './useFetch'
const Home = () => {
 
    const {blogs, isPending, error } =   useFetch('http://localhost:8000/blogs');  

    return (<div className="home">
        { isPending && <p>Loading...</p>}
        { error && <p>{error}</p>}
        
        {
        blogs && <BlogList blogs={blogs}
            title="All blogs"/>
        }
    </div>
    );
    
    }
    export default Home;
