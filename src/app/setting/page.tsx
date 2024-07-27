"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../util/supabase/client";
import { getDate } from "../../../util/date/getDate";
import { Accordion, Button, Modal } from "flowbite-react";
import { IoMdAdd } from "react-icons/io";
import { LunchChoice, Menu } from "../type/type";

export default function Page() {
  const [menu, setMenu] = useState<Menu[]>([]);
  const [date, setDate] = useState<Date[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<any>([[], [], [], [], []]);
  const [showModal, setShowModal] = useState(-1);
  const addMenu = (m: number, d: number) => {
    let temp = selectedMenu[d];
    if (!temp.includes(menu[m])) temp.push(menu[m]);
    setSelectedMenu([
      ...selectedMenu.slice(0, d),
      temp,
      ...selectedMenu.slice(d + 1),
    ]);
  };
  const resetMenu = (d: number) => {
    setSelectedMenu([
      ...selectedMenu.slice(0, d),
      [],
      ...selectedMenu.slice(d + 1),
    ]);
  };
  const removeMenu = (m: number, d: number) => {
    let temp = selectedMenu[d];
    temp = temp.filter((t: Menu) => t.id !== m);
    setSelectedMenu([
      ...selectedMenu.slice(0, d),
      temp,
      ...selectedMenu.slice(d + 1),
    ]);
  };
  const handleSave = async () => {
    const supabase = createClient();
    for (let i = 0; i < 5; i++) {
      const formattedDate = date[i].toISOString().split("T")[0];
      let { data, error } = await supabase
        .from("lunch-choice")
        .delete()
        .eq("date", formattedDate);
    }
    for (let i = 0; i < 5; i++) {
      let temp = selectedMenu[i];
      let { data, error } = await supabase.from("lunch-choice").insert(
        temp.map((t: Menu) => ({
          date: date[i],
          menuId: t.id,
        }))
      );
    }
  };
  const randomMenu = async (d: number) => {
    let typeTemp = "";
    let randomMenu = [];
    let first = 0;
    let last = 0;
    for (let menuItr of menu) {
      if (menuItr.type !== typeTemp) {
        typeTemp = menuItr.type;
        last = menuItr.id - 1;
        if (last > first) {
          let rnd = Math.round(Math.random() * (last - first)) + first;
          console.log(rnd, first, last);
          randomMenu.push(menu[rnd - 1]);
        }
        first = menuItr.id;
      }
    }
    setSelectedMenu([
      ...selectedMenu.slice(0, d),
      randomMenu,
      ...selectedMenu.slice(d + 1),
    ]);
  };
  const fetchSelectedMenu = async () => {
    let date = getDate();
    // console.log(date);
    setDate(date);
    const supabase = createClient();
    const temp: LunchChoice[][] = [[], [], [], [], []];
    for (let i = 0; i < 5; i++) {
      const formattedDate = date[i].toISOString().split("T")[0];
      console.log(date[i], formattedDate);
      let { data: menu, error } = await supabase
        .from("lunch-choice")
        .select(`*, menu:menuId(*)`)
        .eq("date", formattedDate);
      console.log(menu);
      if (menu) temp[i] = menu.map((m: any) => m.menu);
    }
    console.log(temp);
    setSelectedMenu(temp);
  };

  const fetchMenu = async () => {
    const supabase = createClient();
    let { data: menu, error } = await supabase.from("menu").select("*");
    if (menu) setMenu(menu as any);
    // console.log(menu);
  };
  useEffect(() => {
    fetchMenu();
    fetchSelectedMenu();
  }, []);
  return (
    <div className="h-screen p-2 max-w-md mx-auto flex flex-col">
      <div className="flex flex-col gap-3">
        <h1>Settings</h1>
        <Accordion>
          {date.map((d, i) => (
            <Accordion.Panel key={`${i + 0}`}>
              <Accordion.Title>{d.toDateString()}</Accordion.Title>
              <Accordion.Content>
                <div className="m-2 flex flex-col gap-3">
                  <div className="flex w-full justify-end gap-1">
                    <Button color="warning" onClick={() => randomMenu(i)}>
                      random
                    </Button>
                    <Button color="failure" onClick={() => resetMenu(i)}>
                      reset
                    </Button>
                  </div>
                  <div>
                    <div>
                      {selectedMenu[i].map((m: Menu) => (
                        <div
                          key={m.id}
                          className="flex justify-between h-12 m-2"
                          onClick={() => removeMenu(m.id, i)}
                        >
                          <p>{m.menu}</p>
                          <p>{m.price}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      color="success"
                      className="w-full"
                      onClick={() => {
                        setShowModal(i);
                      }}
                    >
                      <IoMdAdd></IoMdAdd>
                    </Button>
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Panel>
          ))}
        </Accordion>
        <Button color="success" onClick={handleSave}>
          Save
        </Button>
      </div>
      <Modal
        dismissible
        show={showModal >= 0}
        onClose={() => setShowModal(-1)}
        className="mx-auto"
      >
        <Modal.Header>Menu</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            {menu.map((m) => (
              <div key={m.id}>
                <div
                  className="flex justify-between  hover:bg-gray-200 p-4 rounded-md"
                  onClick={() => addMenu(m.id, showModal)}
                >
                  <p>{m.menu}</p>
                  <p>{m.price}</p>
                </div>
                <hr />
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
