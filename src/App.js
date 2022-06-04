import Navbar from './navbar';
import Home from './Home';
import  { Route, Routes } from 'react-router-dom'
import Create from './create';
import BlogDetails from './blogDetails';
import NotFound from './notfound';

function App() {
    return (
        
            <div className="App">
                <Navbar/>
                <div className="content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/create" element={<Create />} />
                        <Route path="/blogs/:id" element={<BlogDetails />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>                    
                </div>
            </div>
        
    );
}

export default App;
