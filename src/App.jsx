import * as React from 'react';
import {useState} from 'react';
import axios from 'axios';
import './App.css';
import {SearchForm} from './SearchForm';
import {List} from './List';
import { LastSearches } from './LastSearches';




const useStorageState = (
  key,
  initialState
)=>{
  const[value,setValue]= useState(localStorage.getItem(key) || initialState);

  const isMounted = React.useRef(false);

  React.useEffect(()=>{
    if(!isMounted.current){
      isMounted.current=true;
    }else{
      localStorage.setItem(key,value);
    }
    
  },[key,value]);

  return [value,setValue]
};



const API_BASE = "https://hn.algolia.com/api/v1";
const API_SEARCH="/search";
const PARAM_SEARCH="query=";
const PARAM_PAGE="page=";



const storiesReducer = (state,action)=>{
  switch (action.type){
    case 'STORIES_FETCH_INIT':
      return {...state,isLoading:true,isError:false};
    case 'STORIES_FETCH_FAILURE':
      return {...state,isLoading:false,isError:true};
    case 'STORIES_FETCH_SUCCESS':
      return {
        data: action.payload.page===0 ? action.payload.list: state.data.concat(action.payload.list),
        page: action.payload.page,
        isLoading:false,
        isError:false
      };
    case 'REMOVE_STORY':
      return {...state,data: state.data.filter(story=>story.objectID!==action.payload.objectID)};
    default:
      throw new Error();
  }
};

const getSumComments = (stories) => stories.data.reduce((result,value)=>result + value.num_comments,0);

const extractSearchTerm = url => url.substring(url.lastIndexOf('?')+1,url.lastIndexOf('&'))
  .replace(PARAM_SEARCH,'');

const getLastSearches = (urls) => urls.reduce((result,url,index)=>{
    const searchTerm = extractSearchTerm(url);
    const searchIndex = result.indexOf(searchTerm);
    if(index === 0 || searchIndex == -1)
      return result.concat(searchTerm);

    const lastTerm = result[result.length-1];
    if(searchIndex != -1 && lastTerm != searchTerm)
        return result.filter(s => s != searchTerm).concat(searchTerm);

    return result;

  },[]).slice(-6)
    .slice(0,-1); 

const getUrl = (searchTerm,page) => `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;



const App = () =>{

  const[searchTerm,setSearchTerm]=useStorageState("search", 'React');
  const[urls,setUrls]=useState([getUrl(searchTerm,0)]);
  const[stories,dispatchStories]=React.useReducer(storiesReducer,{
    data:[], page:0, isLoading:false, isError:false 
  });

  const lastSearches = getLastSearches(urls);

  const handleSearch = (searchTerm,page)=>{
    const url = getUrl(searchTerm,page);
    setUrls(urls.concat(url));
  };

  const handleLastSearch = (searchTerm) =>{
    setSearchTerm(searchTerm);
    handleSearch(searchTerm,0);
  };

  const handleMore = ()=>{
    const lastUrl = urls[urls.length-1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm,stories.page+1);
  };

  const handleFetchStories = React.useCallback(async ()=>{
    
      dispatchStories({type:'STORIES_FETCH_INIT'});
     try{
        const lastUrl = urls[urls.length-1];
        const result = await axios.get(lastUrl);
        dispatchStories({type:'STORIES_FETCH_SUCCESS',payload: {list: result.data.hits,page: result.data.page}});
     }catch{
        dispatchStories({type:'STORIES_FETCH_FAILURE'});
     }

  },[urls]);

  React.useEffect(()=>{
    handleFetchStories();
  },[handleFetchStories]);


  const handleSearchInput = (event)=>{
    setSearchTerm(event.target.value);
  };


  const handleSearchSubmit = (event) =>{
    handleSearch(searchTerm,0);
    event.preventDefault();
  };

  
  const sumComments = React.useMemo(
    ()=>getSumComments(stories),
  [stories]);

  const handleRemoveStory = React.useCallback(
    (item)=>{
      dispatchStories({type:'REMOVE_STORY',payload:item});
    },[]
  );

  return (
        <div className='container'>
          <h1 className='headline-primary'>Hacker Stories with {sumComments} comments</h1>

          <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit}/>

          <LastSearches lastSearches={lastSearches} onLastSearch={handleLastSearch} />

          {stories.isError && <p>Something went wrong...</p>}

          <List list={stories.data} onRemoveItem={handleRemoveStory}/>

          {
            stories.isLoading ? 
              (<p className='p-more'>Loading...</p>) :
              (<button onClick={handleMore} className='button button-more'>More</button>)
          }

          

        </div>
  );

};
  

export default App;

export {storiesReducer,SearchForm,List};



