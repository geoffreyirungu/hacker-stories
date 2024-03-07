import * as React from 'react';
import Check from './check.svg?react';
import { sortBy } from 'lodash';



const Item= ({item,onRemoveItem})=>(
    <li className='item' /*style={{display:'flex'}}*/>
      <span style={{width:'40%'}}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={{width:'30%'}}>{item.author}</span>
      <span style={{width:'10%'}}>{item.num_comments}</span>
      <span style={{width:'10%'}}>{item.points}</span>
      <span style={{width:'10%'}}>
        <button onClick={()=>onRemoveItem(item)} className='button button-small'><Check height="18px" width="18px"/> Dismiss</button>
      </span>
    </li>
);

const SORTS = {
    NONE: (list)=>list,
    TITLE: (list) => sortBy(list,'title'),
    AUTHOR: (list) => sortBy(list,list=>list.author.toLowerCase()),
    COMMENT: (list) => sortBy(list,'num_comments').reverse(),
    POINT: (list) => sortBy(list,'points').reverse()
};

const applyAsc = (sortKey,sortObj) =>{
  if(sortKey == sortObj.sortKey && !sortObj.isReverse)
    return <i className="fas fa-sort-down fa-2x"></i>
  else if(sortKey == sortObj.sortKey && sortObj.isReverse)
    return <i className="fas fa-sort-up fa-2x"></i>
  else
    return <i className=""></i>
} 

const List = React.memo(
({list,onRemoveItem})=>{

    const [sort,setSort] = React.useState({
        sortKey: 'NONE',
        isReverse: false
    });

    const handleSort = (sortKey)=> {
        const isReverse = sort.sortKey === sortKey && !sort.isReverse;
        setSort({sortKey,isReverse});
    };

    const sortFunction = SORTS[sort.sortKey];

    const sortedList = sort.isReverse ? sortFunction(list).reverse() : sortFunction(list);

    return (
        <ul>
            <li className='item' /*style={{display:'flex'}}*/>
              <span style={{width:'40%'}}>
                <button onClick={()=>handleSort('TITLE')} className='button button-large button-flex'>Title{applyAsc('TITLE',sort)}</button>
              </span>
              <span style={{width:'30%'}}>
                <button onClick={()=>handleSort('AUTHOR')} className='button button-large button-flex'>Author{applyAsc('AUTHOR',sort)}</button>
              </span>
              <span style={{width:'10%'}}>
                <button onClick={()=>handleSort('COMMENT')} className='button button-large button-flex'>Comments{applyAsc('COMMENT',sort)}</button>
              </span>
              <span style={{width:'10%'}}>
                <button onClick={()=>handleSort('POINT')} className='button button-large button-flex'>Points{applyAsc('POINT',sort)}</button>
              </span>
              <span style={{width:'10%'}}>Actions</span>
            </li>
          {
            sortedList.map((item)=>
            
              <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>
            
            )
          }
        </ul>
        );

}

);

export {List};
