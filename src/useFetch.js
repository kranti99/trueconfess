import {useState, useEffect} from 'react';

const useFetch = (url) =>{
    const [blogs, setBlogs] = useState(null);
    const [isPending, setIsPending] =  useState(true);
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(url)
        .then(res => {
            if(!res.ok){
                throw Error('Something wrong')
            }
            return res.json(); // response object   //json()=parse object to javascript value
        }).then(data => {
            setBlogs(data);
            setIsPending(false);
            setError(null);
        }).catch(err=>{
            setError(err.message)
            console.log(err.message);
            setIsPending(false);
        })
},  [url]);
return{blogs, isPending, error}
}

export default useFetch
