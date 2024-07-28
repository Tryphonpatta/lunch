"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../util/supabase/client";
import { Card } from "flowbite-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Summary() {
  const [menuCount, setMenuCount] = useState<any>([]);
  const [date, setDate] = useState(new Date());
  const [price, setPrice] = useState(0);
  const fetchTodayMeal = async (date: Date) => {
    // console.log(date);
    const supabase = createClient();
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    const formattedDate = localDate.toISOString().split("T")[0];
    // console.log(formattedDate);
    let { data: menues, error } = await supabase.rpc("get_menu_counts", {
      selected_date: formattedDate,
    });
    // console.log(menues);
    setMenuCount(menues);
    let price = 0;
    for (let menu of menues) {
      console.log(menu);
      price += menu.price * menu.order_count;
    }
    // console.log(price);
    setPrice(price);
  };
  useEffect(() => {
    fetchTodayMeal(date);
  }, []);

  return (
    <div className="flex justify-center">
      <Card className="w-80">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Summary
        </h5>
        <DatePicker
          value={date.toDateString()}
          onChange={(e) => {
            if (e) {
              // console.log(e);
              setDate(e);
              fetchTodayMeal(e);
            }
          }}
          dateFormat={"yyyy-MM-dd"}
        />
        {menuCount.map((m: any, i: any) => (
          <div className="flex justify-between w-full" key={`${i + 0}`}>
            <div>
              <p>{m.menu}</p>
              <p>({m.price})</p>
            </div>
            <div>{m.order_count}</div>
          </div>
        ))}
        <div className="flex justify-between w-full">
          <p>Total</p>
          <p>{price}</p>
        </div>
      </Card>
    </div>
  );
}
