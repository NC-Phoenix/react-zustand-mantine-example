import { useEffect, useRef, useState } from 'react';
import { MantineProvider, Container, ActionIcon, TextInput, NumberInput, Table } from '@mantine/core';
import { IconDeviceFloppy, IconEdit, IconTrash } from '@tabler/icons-react';
import { create } from 'zustand';

import '@mantine/core/styles.css';
import './App.css';

const url_m = "http://localhost:8080/products";
const url_s = "http://localhost:8080/product/";
const useStore = create(set => ({
  Datas: {},
  addData: (data) => {
    set(() => ({ 
      Datas: data 
    }))
    console.log(data);
  },
  addDataToDb: (data) => {
    
    delete data["id"];
    const json = JSON.stringify(data);
    console.log(json);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json
    };
    fetch(url_m, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        set((state) => ({ 
          Datas: [...state.Datas, result]
        }));
      });
  },
  editDataInDb: (data) => {
    const url = url_s + data.id;
    const json = JSON.stringify(data);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json
    };
    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        set((state) => ({ 
          Datas: [
            ...state.Datas.slice(0, state.Datas.findIndex(d => d.id==data.id)), 
            result, 
            ...state.Datas.slice(state.Datas.findIndex(d => d.id==data.id)+1)
          ]
        }));
      });
    
  },
  delDataFromDb: (id) => {
    const url = url_s + id;
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    };
    fetch(url, requestOptions)
      .then((response) => response.json());
    set((state) => ({ 
      Datas: [...state.Datas.filter(d => d.id!=id)]
    }));
  }
}));

const useFetch = (url) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  }, [url])
  
  return data;
};

function App(){
  const data = useFetch(url_m);
  const datas = useStore((state) => state.Datas);
  const addData = useStore((state) => state.addData);
  const addDataToDb = useStore((state) => state.addDataToDb);
  const editDataInDb = useStore((state) => state.editDataInDb);
  const delDataFromDb = useStore((state) => state.delDataFromDb);
  const inputRefId = useRef();
  const inputRefName = useRef();
  const inputRefBrand = useRef();
  const inputRefPrice = useRef();

  const addNewData = () => {
    const selId = parseInt(inputRefId.current.value);
    const newData = {
      id: (selId ? selId : datas.length + 1),
      name: inputRefName.current.value,
      brand: inputRefBrand.current.value,
      price: parseFloat(inputRefPrice.current.value)
    }
    selId ? editDataInDb(newData) : addDataToDb(newData);
    inputRefId.current.value = "";
    inputRefName.current.value = "";
    inputRefBrand.current.value = "";
    inputRefPrice.current.value = "";
  };

  const editData = (data) => {
    inputRefId.current.value = data.id;
    inputRefName.current.value = data.name;
    inputRefBrand.current.value = data.brand;
    inputRefPrice.current.value = data.price.toFixed(2);
  };

  const delData = (id) => {
    delDataFromDb(id);
  };

  useEffect(() => {
    if(data){
      addData(data);
    }
  }, [data, addData])

  const rows = Array.from(datas).map((data) => (
    <Table.Tr key={data.id}>
      <Table.Td>{data.id}</Table.Td>
      <Table.Td>{data.name}</Table.Td>
      <Table.Td>{data.brand}</Table.Td>
      <Table.Td>{data.price.toFixed(2)}</Table.Td>
      <Table.Td>
        <ActionIcon className="btnMargin" color="cyan" onClick={() => editData(data)}><IconEdit /></ActionIcon>
        <ActionIcon className="btnMargin" color="red" onClick={() => delData(data.id)}><IconTrash /></ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  const newRow = (
    <Table.Tr key={datas.length+1}>
      <Table.Td><TextInput size="xs" ref={inputRefId} disabled /></Table.Td>
      <Table.Td><TextInput size="xs" ref={inputRefName} /></Table.Td>
      <Table.Td><TextInput size="xs" ref={inputRefBrand} /></Table.Td>
      <Table.Td><NumberInput size="xs" decimalScale={2} fixedDecimalScale ref={inputRefPrice} /></Table.Td>
      <Table.Td>
        <ActionIcon className="btnMargin" onClick={addNewData}><IconDeviceFloppy /></ActionIcon>
      </Table.Td>
    </Table.Tr>
  );

  return (
    <>
      <MantineProvider>
        <Container fluid p={20}>
          <Table highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Brand</Table.Th>
                <Table.Th>Price (THB)</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}{newRow}</Table.Tbody>
          </Table>
        </Container>
      </MantineProvider>
    </>
  );
}

export default App;