import { Link } from 'react-router-dom';

const NotFound = () => {
    return ( <div className="notfound">
        <h2>Sorry</h2>
        <Link to='/'>Back TO Home</Link>
    </div> );
}
 
export default NotFound;