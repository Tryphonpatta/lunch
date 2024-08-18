"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../util/supabase/client";
import { getDate } from "../../../util/date/getDate";
import { Accordion, Button, Modal, ToggleSwitch } from "flowbite-react";
import { IoMdAdd } from "react-icons/io";
import { LunchChoice, Menu } from "../type/type";
import { ToastContainer, toast } from "react-toastify";
import LoginPage from "./components/loginPage";
import { set } from "react-datepicker/dist/date_utils";
import "react-toastify/dist/ReactToastify.css";

export default function Page() {
  const [menu, setMenu] = useState<Menu[]>([]);
  const [date, setDate] = useState<Date[]>([]);
  const [disableDate, setDisableDate] = useState<number[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<any>([[], [], [], [], []]);
  const [showModal, setShowModal] = useState(-1);
  const [isLogin, setIsLogin] = useState(false);
  const addMenu = (m: number, d: number) => {
    // console.log(d, m);
    let temp = selectedMenu[d];
    if (!temp.includes(menu[m - 1])) temp.push(menu[m - 1]);
    setSelectedMenu([
      ...selectedMenu.slice(0, d),
      temp,
      ...selectedMenu.slice(d + 1),
    ]);
    setShowModal(-1);
  };
  const resetMenu = (d: number) => {
    setSelectedMenu([
      ...selectedMenu.slice(0, d),
      [],
      ...selectedMenu.slice(d + 1),
    ]);
  };
  const removeMenu = (m: number, d: number) => {
    // console.log(d, m);
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
    let { data, error } = await supabase
      .from("disableDay")
      .delete()
      .in(
        "date",
        date.map((d) => d.toISOString().split("T")[0])
      );
    for (let i = 0; i < 5; i++) {
      if (disableDate[i] === 1) {
        let { data, error } = await supabase.from("disableDay").insert({
          date: date[i].toISOString().split("T")[0],
        });
      }
    }
    toast.success("Save success");
  };

  const checkDupMenu = (m: Menu) => {
    let temp = selectedMenu;
    for (let i = 0; i < 5; i++) {
      if (temp[i].includes(m)) return true;
    }
    return false;
  };

  const randomMenu = async (d: number) => {
    let typeTemp = "";
    let randomMenu = [] as Menu[];
    let first = 0;
    let last = 0;
    let rnd = Math.random();
    let menuSortFromPrice = menu.toSorted((a, b) => a.price - b.price);
    let normalMenu = menuSortFromPrice.filter((m) => m.price < 70);
    let expensiveMenu = menuSortFromPrice.filter((m) => m.price >= 70);
    // console.log(normalMenu, expensiveMenu);
    if (rnd > 0.5) {
      // 79 1 meal
      for (let i = 0; i < 3; i++) {
        let index = Math.round(Math.random() * (normalMenu.length - 1));
        while (
          randomMenu.includes(normalMenu[index]) ||
          checkDupMenu(normalMenu[index])
        ) {
          index = Math.round(Math.random() * (normalMenu.length - 1));
        }
        randomMenu.push(normalMenu[index]);
      }
      let index = Math.round(Math.random() * (expensiveMenu.length - 1));
      randomMenu.push(expensiveMenu[index]);
    } else {
      for (let i = 0; i < 4; i++) {
        let index = Math.round(Math.random() * (normalMenu.length - 1));
        while (randomMenu.includes(normalMenu[index])) {
          index = Math.round(Math.random() * (normalMenu.length - 1));
        }
        randomMenu.push(normalMenu[index]);
      }
    }
    const chicken: Menu[] = menu.filter((m) => m.type === "ไก่");
    const fish = menu.filter((m) => m.type === "ปลา");
    let index = Math.round(Math.random() * (chicken.length - 1));
    while (
      randomMenu.includes(chicken[index]) ||
      checkDupMenu(chicken[index])
    ) {
      index = Math.round(Math.random() * (chicken.length - 1));
    }
    randomMenu.push(chicken[index]);
    rnd = Math.random();
    while (randomMenu.includes(fish[index]) || checkDupMenu(fish[index])) {
      index = Math.round(Math.random() * (fish.length - 1));
    }
    randomMenu.push(fish[index]);

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
      // console.log(date[i], formattedDate);
      let { data: menu, error } = await supabase
        .from("lunch-choice")
        .select(`*, menu:menuId(*)`)
        .eq("date", formattedDate);
      // console.log(menu);
      if (menu) temp[i] = menu.map((m: any) => m.menu);
    }
    // console.log(temp);
    setSelectedMenu(temp);
  };

  const fetchMenu = async () => {
    const supabase = createClient();
    let { data: menu, error } = await supabase.from("menu").select("*");
    if (menu) setMenu(menu as any);
    // console.log(menu);
  };

  const fetchDisable = async () => {
    const supabase = createClient();
    let date = getDate();
    let { data: disable, error } = await supabase
      .from("disableDay")
      .select("*")
      .in(
        "date",
        date.map((d) => d.toISOString().split("T")[0])
      );

    if (disable) {
      let temp = [0, 0, 0, 0, 0];
      for (let d of disable) {
        temp[
          date.findIndex((da) => da.toISOString().split("T")[0] === d.date)
        ] = 1;
      }
      setDisableDate(temp);
    } else setDisableDate([0, 0, 0, 0, 0]);
    // console.log(disable);
  };
  useEffect(() => {
    fetchMenu();
    fetchSelectedMenu();
    fetchDisable();
  }, []);
  return (
    <div>
      <ToastContainer />
      <div className="h-screen p-2 max-w-md mx-auto flex flex-col">
        {!isLogin ? (
          <LoginPage isLogin={isLogin} setIsLogin={setIsLogin}></LoginPage>
        ) : (
          <div className="flex flex-col gap-3">
            <h1>Settings</h1>
            <Accordion>
              {date.map((d, i) => (
                <Accordion.Panel key={`${i + 0} ${d.getDate()}`}>
                  <Accordion.Title>{d.toDateString()}</Accordion.Title>
                  <Accordion.Content>
                    <div className="m-2 flex flex-col gap-3">
                      <div className="flex w-full justify-end gap-1 items-center">
                        <ToggleSwitch
                          checked={disableDate[i] === 0}
                          onChange={() => {
                            let temp = disableDate;
                            temp[i] = temp[i] === 0 ? 1 : 0;
                            setDisableDate([...temp]);
                          }}
                        />
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
        )}
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
    </div>
  );
}
