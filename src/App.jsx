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
  // function เอาข้อมูลที่ได้ไปเก็บไว้ในตัวแปร Datas
  addData: (data) => {
    set(() => ({ 
      Datas: data 
    }))
  },
  // function เอาข้อมูลที่รับมาไปเก็บไว้ใน Database
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
  // function แก้ไขข้อมูลเดิมใน Database
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
  // function ลบข้อมูลเดิมใน Database
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

// ดึงข้อมูลจาก url ที่กำหนด
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
  // เมื่อโหลดหน้าเว็บครั้งแรก ให้ดึงข้อมูลจาก url แล้วเก็บไว้ในตัวแปร data
  const data = useFetch(url_m);

  // useStore ไว้สำหรับเข้าถึงข้อมูลและ function
  const datas = useStore((state) => state.Datas);
  const addData = useStore((state) => state.addData);
  const addDataToDb = useStore((state) => state.addDataToDb);
  const editDataInDb = useStore((state) => state.editDataInDb);
  const delDataFromDb = useStore((state) => state.delDataFromDb);

  // useRef ไว้สำหรับอ้างอิงและเข้าถึงข้อมูลจาก input
  const inputRefId = useRef();
  const inputRefName = useRef();
  const inputRefBrand = useRef();
  const inputRefPrice = useRef();

  // กรณีเพิ่มข้อมูลใหม่ ให้ id เป็น 0 (ไม่ต้องใช้ id)
  // กรณีแก้ไขข้อมูลเดิม ให้ใช้ id จากช่อง column id ของ row ที่กดปุ่ม
  // เมื่อกดปุ่มบันทึก กรณีที่ id เป็น 0 จะเป็นการเพิ่มข้อมูลใหม่ ถ้ามี id จะเป็นการแก้ไขข้อมูลเดิม
  const addNewData = () => {
    const selId = parseInt(inputRefId.current.value);
    const newData = {
      id: (selId ? selId : 0),
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

  // เมื่อกดปุ่มแก้ไข ให้เอาข้อมูลจาก row ที่กดปุ่ม มาใส่ใน input
  const editData = (data) => {
    inputRefId.current.value = data.id;
    inputRefName.current.value = data.name;
    inputRefBrand.current.value = data.brand;
    inputRefPrice.current.value = data.price.toFixed(2);
  };

  // เมื่อกดลบข้อมูล ให้ลบข้อมูลโดยใช้ id จากช่อง column id ของ row ที่กดปุ่ม
  const delData = (id) => {
    delDataFromDb(id);
  };

  // เมื่อโหลดหน้าเว็บครั้งแรก ให้เอาข้อมูลไปเก็บไว้ในตัวแปร Datas เลย
  useEffect(() => {
    if(data){
      addData(data);
    }
  }, [data, addData])

  // เอาข้อมูลมาใส่ลงใน row
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

  // row ที่เอาไว้เพิ่มข้อมูล
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

  // นำ table row ไปรวมกับ table head แล้วนำไปแสดงผล
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