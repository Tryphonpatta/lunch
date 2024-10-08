"use client";
import { Button, Checkbox, Label, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { createClient } from "../../util/supabase/client";
import { LunchChoice, Menu, team } from "./type/type";
import { getDate } from "../../util/date/getDate";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { table } from "console";
import { set } from "react-datepicker/dist/date_utils";
import moment from "moment";

export default function Home() {
  const [name, setName] = useState("");
  const [team, setTeam] = useState<team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number>(1);
  const [menu, setMenu] = useState<Menu[]>([]);
  const [menuMap, setMenuMap] = useState<Map<number, Menu>>(new Map());
  const [mealChoice, setMealChoice] = useState<Menu[][]>([]);
  const [disableDate, setDisableDate] = useState<number[]>([]);
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
  const [isFinishSubmit, setIsFinishSubmit] = useState(false);

  const supabase = createClient();
  const fetchTeam = async () => {
    let { data: team, error } = await supabase.from("team").select("*");
    if (team) {
      setTeam(team as any);
      setSelectedTeam(team[0].id);
    }
  };
  const fetchMenu = async () => {
    let date = getDate();
    setDate(date);
    // console.log(date);
    const supabase = createClient();
    const temp: Menu[][] = [[], [], [], [], []];
    const disableTemp = [];
    const { data: menu, error } = await supabase.from("menu").select("*");
    if (menu) {
      const temp = new Map<number, Menu>();
      for (let m of menu) {
        temp.set(m.id, m);
      }
      setMenuMap(temp);
    }
    const { data: disable } = await supabase
      .from("disableDay")
      .select("*")
      .in(
        "date",
        date.map((d) => moment(d).format("YYYY-MM-DD"))
      );
    let disableDateTemp = [0, 0, 0, 0, 0];
    if (disable) {
      for (let d of disable) {
        disableDateTemp[
          date.findIndex((da) => moment(da).format("YYYY-MM-DD") === d.date)
        ] = 1;
      }
      setDisableDate(disableDateTemp);
    } else setDisableDate([0, 0, 0, 0, 0]);
    if (menu) setMenu(menu as any);
    for (let i = 0; i < 5; i++) {
      const formattedDate = moment(date[i]).format("YYYY-MM-DD");
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
      const formattedDate = moment(date[i]).format("YYYY-MM-DD");
      const { data: userMealtemp } = await supabase
        .from("user-lunch")
        .select(`*, menu:menuId(*)`)
        .eq("date", formattedDate)
        .eq("team", team[team.findIndex((t) => t.id === selectedTeam)].team)
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
    if (isFinishSubmit) return;
    setIsFinishSubmit(true);
    // console.log(selectedMenu);
    for (let i = 0; i < 5; i++) {
      const formattedDate = moment(date[i]).format("YYYY-MM-DD");
      await supabase
        .from("user-lunch")
        .delete()
        .eq("date", formattedDate)
        .eq("team", team[team.findIndex((t) => t.id === selectedTeam)].team)
        .eq("user", name);
      if (disable.includes(i)) continue;
      if (selectedMenu[i].length === 0) continue;
      let { data: userLunch } = await supabase.from("user-lunch").insert({
        date: formattedDate,
        team: team[team.findIndex((t) => t.id === selectedTeam)].team,
        user: `${name}`,
        menuId: selectedMenu[i][0].id,
      });
    }
    toast.success("saved");
    setIsFinishSubmit(false);
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
                  checked={!disable.includes(i) && disableDate[i] === 0}
                  onChange={() => {
                    if (disable.includes(i)) {
                      setDisable(disable.filter((d) => d !== i));
                    } else {
                      setDisable([...disable, i]);
                    }
                  }}
                  disabled={mealChoice[i]?.length === 0 || disableDate[i] === 1}
                />
              </div>
              <Select
                id={`${i.toString() + 0}`}
                required
                className="max-w-md"
                disabled={disable.includes(i) || disableDate[i] === 1}
                value={selectedMenu[i][0]?.id}
                onChange={(e) => {
                  const m = menuMap.get(parseInt(e.target.value));
                  setSelectedMenu([
                    ...selectedMenu.slice(0, i),
                    [m as Menu],
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
