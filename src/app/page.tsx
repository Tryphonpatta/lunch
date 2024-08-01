"use client";
import { Button, Checkbox, Label, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { createClient } from "../../util/supabase/client";
import { LunchChoice, Menu, team } from "./type/type";
import { getDate } from "../../util/date/getDate";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [name, setName] = useState("");
  const [team, setTeam] = useState<team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number>(1);
  const [menu, setMenu] = useState<Menu[]>([]);
  const [mealChoice, setMealChoice] = useState<Menu[][]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu[][]>([
    [],
    [],
    [],
    [],
    [],
  ]);
  const [disable, setDisable] = useState<Number[]>([]);
  const [date, setDate] = useState<Date[]>([]);
  const [isLoad, setIsload] = useState(false);
  const supabase = createClient();
  const fetchTeam = async () => {
    let { data: team, error } = await supabase.from("team").select("*");
    if (team) setTeam(team as any);
  };
  const fetchMenu = async () => {
    let date = getDate();
    setDate(date);
    // console.log(date);
    const supabase = createClient();
    const temp: Menu[][] = [[], [], [], [], []];
    const disableTemp = [];
    const { data: menu, error } = await supabase.from("menu").select("*");
    if (menu) setMenu(menu as any);
    for (let i = 0; i < 5; i++) {
      const formattedDate = date[i].toISOString().split("T")[0];
      let { data: menu, error } = await supabase
        .from("lunch-choice")
        .select(`*, menu:menuId(*)`)
        .eq("date", formattedDate);
      // console.log(menu);
      if (menu && menu?.length > 0) temp[i] = menu.map((m: any) => m.menu);
      else disableTemp.push(i);
    }
    setMealChoice(temp);
    setDisable(disableTemp);
  };
  const fetchUserData = async () => {
    const supabase = createClient();
    const temp = [[], [], [], [], []] as any;
    const disableTemp = disable;
    for (let i = 0; i < 5; i++) {
      const formattedDate = date[i].toISOString().split("T")[0];
      const { data: userMealtemp } = await supabase
        .from("user-lunch")
        .select(`*, menu:menuId(*)`)
        .eq("date", formattedDate)
        .eq("team", team[selectedTeam - 1].team)
        .eq("user", name);
      const userMeal = userMealtemp as any;
      if (
        userMeal &&
        userMeal.length > 0 &&
        userMeal[0].menuId &&
        mealChoice[i].find((m) => m.id === userMeal[0].menuId)
      ) {
        temp[i].push(userMeal[0].menu);
      } else if (!disable.includes(i) && mealChoice[i].length > 0) {
        // console.log(mealChoice[i]);
        temp[i].push(mealChoice[i][0]);
        if (disableTemp.includes(i)) continue;
        else disableTemp.push(i);
      } else {
        if (disableTemp.includes(i)) continue;
        else disableTemp.push(i);
      }
    }
    setSelectedMenu(temp);
    setIsload(true);
    setDisable(disableTemp);
    toast.info("loaded");
  };
  const saveUserData = async () => {
    // console.log(selectedMenu);
    for (let i = 0; i < 5; i++) {
      const formattedDate = date[i].toISOString().split("T")[0];
      await supabase
        .from("user-lunch")
        .delete()
        .eq("date", formattedDate)
        .eq("team", team[selectedTeam - 1].team)
        .eq("user", name);
      if (disable.includes(i)) continue;
      if (selectedMenu[i].length === 0) continue;
      let { data: userLunch } = await supabase.from("user-lunch").insert({
        date: formattedDate,
        team: team[selectedTeam - 1].team,
        user: `${name}`,
        menuId: selectedMenu[i][0].id,
      });
    }
    toast.success("saved");
  };
  useEffect(() => {
    fetchTeam();
    fetchMenu();
  }, []);
  return (
    <div className="h-screen">
      <ToastContainer />
      <div className="p-2 gap-3 flex flex-col">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name" value="Your name" />
          </div>
          <TextInput
            id="name"
            type="text"
            icon={FaCircleUser}
            placeholder="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="teams" value="Select your team" />
          </div>
          <Select
            id="teams"
            required
            className="max-w-md"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(parseInt(e.target.value))}
          >
            {team?.map((t) => (
              <option key={t.id} value={t.id} className="w-32">
                {t.team}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full flex justify-end">
          <Button
            color="warning"
            onClick={() => {
              fetchUserData();
            }}
          >
            load
          </Button>
        </div>
        {isLoad &&
          date?.map((d, i) => (
            <div key={`${d.toDateString()}`}>
              <div className="mb-2 block">
                <Label
                  htmlFor={`${d.toDateString() + 0}`}
                  value={`${d.toDateString()}`}
                />
                <Checkbox
                  className="mx-2"
                  id="accept"
                  checked={!disable.includes(i)}
                  onChange={() => {
                    if (disable.includes(i)) {
                      setDisable(disable.filter((d) => d !== i));
                    } else {
                      setDisable([...disable, i]);
                    }
                  }}
                  disabled={mealChoice[i]?.length === 0}
                />
              </div>
              <Select
                id={`${i.toString() + 0}`}
                required
                className="max-w-md"
                disabled={disable.includes(i)}
                value={selectedMenu[i][0]?.id}
                onChange={(e) => {
                  // console.log(e.target.value);
                  setSelectedMenu([
                    ...selectedMenu.slice(0, i),
                    [menu[parseInt(e.target.value) - 1]],
                    ...selectedMenu.slice(i + 1),
                  ]);
                }}
              >
                {mealChoice[i]?.map((m) => (
                  <option key={m.id} value={m.id} className="w-32">
                    {m.menu}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        {isLoad && (
          <div className="w-full flex ">
            <Button
              color="success"
              onClick={() => {
                saveUserData();
              }}
              className="w-full"
            >
              save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
