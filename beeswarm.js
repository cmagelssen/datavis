/** @format */

import React, { useEffect, useRef, useState, useCallback } from "react";
import "./SwarmPlot.css";
import * as d3 from "d3";

const SwarmPlot = () => {
  const d3Chart = useRef();

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/cmagelssen/doktorgrad/master/csvjson.json"
    )
      .then((response) => response.json())
      .then((data) => {
        data = data.filter((d) => d.split === 1)
        data = data.filter((d) => !Number.isNaN(d.performance))
        data = data.filter((d) => d.day === 2)
      
      
        data = data
          .sort((a, b) => d3.ascending(a.day, b.day) || d3.ascending(a.course, b.course))
          

        const dataGrouped = d3.groups(data, (d) => d.course);


        // Setting up the d3.js margin convention
        const margin = {
          top: 20,
          right: 40,
          bottom: 40,
          left: 40,
        };

        const width = parseInt(d3.select("#d3box").style("width"));
        const height = parseInt(d3.select("#d3box").style("height"));

        const svg = d3
          .select(d3Chart.current)
          .attr("width", width)
          .attr("height", height);

        const g = svg
          .selectAll(".g")
          .data([1])
          .join("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const padding = 40;
        const xValue = (d) => d.performance;

        const innerHeight = height - margin.top - margin.bottom;
        const innerWidth = width - margin.left - margin.right;
        const cellpadding = 10;
        const cellHeight = innerHeight / 2 - cellpadding;

        const xScale = d3
          .scaleLinear()
          .domain(d3.extent(data, xValue)) // Here I used an acessor function
          .range([0, innerWidth])
          .nice();

        const yScale = d3
          .scalePoint()
          .domain(data.map((d) => d.course))
          .range([cellHeight, 0])
          .padding(0.3);

        let colorScale = d3
          .scaleOrdinal()
          .domain(["A", "B", "C"])
          .range(["#AA3939", "#226666", "#7B9F35"]);

        const xAxis = d3
          .axisBottom()
          .scale(xScale)
          .tickPadding(8)
          .ticks(5)
          .tickSize(-cellHeight);

        const yAxis = d3
          .axisLeft()
          .scale(yScale)
          .tickSize(-innerWidth)
          .tickPadding(8);

        const cellA = g.append("g").attr("class", "cellA");

        const cellB = g
          .append("g")
          .attr("class", "cellB")
          .attr("transform", `translate(0, ${cellHeight})`); //This code makes the exact same thing as the transform code for cellA, but with a different offset

        const yAxisG = cellA
          .append("g")
          .attr("class", "y-axis")
          .call(yAxis)
          .attr("transform", `translate(0, ${cellHeight})`)
          .selectAll(".domain")
          .remove();

        const xAxisG = cellB
          .append("g")
          .attr("class", "x-axis")
          .call(xAxis)
          .attr("transform", `translate(0, ${cellHeight})`)
          .selectAll(".domain")
          .remove();

        const distributionPlot = cellA
          .selectAll(null)
          .data(dataGrouped)
          .join("path")
          .attr("class", "area")
          
     
          .attr("fill", (d, i) => colorScale(d[0]))
          .attr("d", (d, i) => {
            // Creating the bingenerator and passing it xScale domain
            const bingenerator = d3
              .bin()
              .domain(xScale.domain())
              .value(xValue)
              .thresholds(20);

            // then passing the data into the bingenerator. Remember the "sticky" pattern in d3.js
            // , so we moved one step further into the nested array
            const binnedData = bingenerator(d[1]);

            const distributionPlotyScale = d3
              .scaleLinear()
              .domain(d3.extent(binnedData, (d) => d.length))
              .range([cellHeight, 0]);

            const distributionplotGenerator = d3
              .area()
              .x((d) => xScale((d.x0 + d.x1) / 2))
              .y0(cellHeight)
              .y1((d) => distributionPlotyScale(d.length))
              .curve(d3.curveBasis);

            return distributionplotGenerator(binnedData);
          })
          .attr("stroke", "black");

        const circles = cellB
          .selectAll(".innerMarks")
          .data(dataGrouped)
          .join("g")
          .attr("class", (d) => console.log(d));

        circles
          .selectAll("circle")
          .data((d) => d[1])
          .join("circle")
          .attr("class", "marks")
          .attr("cy", (d) => yScale(d.course))
          .attr("cx", (d) => xScale(xValue(d)))
          .attr("r", 3)
          .attr("fill", (d) => colorScale(d.course))
          .attr("stroke", "#333");

        function tick() {
          d3.selectAll(".marks")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
        }

        let simulation = d3
          .forceSimulation(data)
          .force(
            "x",
            d3
              .forceX((d) => {
                return xScale(d.performance);
              })
              .strength(1)
          )

          .force(
            "y",
            d3
              .forceY((d) => {
                return yScale(d.course);
              })
              .strength(1)
          )

          .force(
            "collide",
            d3.forceCollide((d) => {
              return 3;
            })
          )

          .alphaDecay(0)
          .alpha(1)
          .on("tick", tick);

        let init_decay = setTimeout(function () {
          console.log("start alpha decay");
          simulation.alphaDecay(0.1);
        }, 2000); // start decay after 3 seconds
      });
  });


  return (
    <div id="d3box">
      <svg ref={d3Chart}></svg>
    </div>
  );
};

export default SwarmPlot;
