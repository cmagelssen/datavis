/** @format */

import React, { useEffect, useRef, useState, useCallback } from "react";
import "./regression.css";
import * as d3 from "d3";

const Regression = () => {
  const regressionPlot = useRef();

  useEffect(() => {
    const data = d3.range(150).map((i) => ({
      bib: Math.floor(i / 5) + 1,
      performance: -1 + Math.random() * 5,
      split: [1, 2, 3, 4, 5][i % 5],
    }));

    // Setting up the d3.js margin convention
    const width = parseInt(d3.select("#regressionBox").style("width"));
    const height = parseInt(d3.select("#regressionBox").style("height"));
    // Standard margin convention
    const margin = {
      top: 30,
      right: 20,
      bottom: 30,
      left: 20,
    };
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    // Padding between G elements in the facetplot
    const cellXY = 8;
    const padding = 24;
    const cellHeight = innerHeight / cellXY - padding * 2;
    const cellWidth = innerWidth / cellXY - padding * 2;

    // Accessor functions
    const xValue = (d) => d.split;
    const yValue = (d) => d.performance;

    // Selectiong svg
    const svg = d3
      .select(regressionPlot.current)
      .attr("width", width)
      .attr("height", height);
    // Appending g elements for the margin convention
    const g = svg
      .selectAll(".gMargin")
      .data([1])
      .join("g")
      .attr("class", "gMargin")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // This is the trick to create facets. Use d3.cross to spread the G-elements around
    const cellsMatrix = g
      .selectAll(".cellmatrix")
      .data(d3.cross(d3.range(cellXY), d3.range(cellXY)))
      .join("g")
      .attr("class", "cellmatrix")
      .attr(
        "transform",
        ([i, j]) =>
          `translate(${i * (padding + cellWidth + padding)},${
            j * (padding + cellHeight + padding)
          })`
      );

    // Group data on bib
    const dataGrouped = d3.groups(data, (d) => d.bib);

    // Scales
    const xScaleRegression = d3
      .scalePoint()
      .domain(data.map(xValue))
      .range([0, cellWidth])
      .padding(0.7);

    const yScaleRegression = d3
      .scaleLinear()
      .domain(d3.extent(data, yValue))
      .range([cellHeight, 0])
      .nice();

    // Axis

    const xAxisRegression = d3
      .axisBottom()
      .scale(xScaleRegression)
      .tickSize(-cellHeight);
    const yAxisRegression = d3
      .axisLeft()
      .scale(yScaleRegression)
      .ticks(3)
      .tickSize(-cellWidth);

    // Here I select all the G that I spread out earlier and join the grouped data
    const cells = d3.selectAll(".cellmatrix").data(dataGrouped).join("g");

    // Appending background so that the facets looks a bit different
    const backgroundColor = cells
      .append("rect")
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr("fill", "#F5F3F2");

    // Here I append the Axis. I used raised() to make the axis on top of the background color
    const gXAxisRegression = cells
      .append("g")
      .raise()
      .call(xAxisRegression)
      .attr("transform", "translate(" + [0, cellHeight] + ")")
      .attr("class", "x-axis")
      .selectAll(".domain")
      .remove();

    const gYAxisRegression = cells
      .append("g")
      .call(yAxisRegression)
      .attr("class", "y-axis")
      .selectAll(".domain")
      .remove();

    // Here I draw the points
    // Here you can see the sticky pattern of d3.in action.
    const marks = cells
      .selectAll(".pointregression")
      .raise()
      .data((d) => d[1])
      .join("circle")
      .attr("class", "pointregression")
      .attr("cx", (d) => xScaleRegression(xValue(d)))
      .attr("cy", (d) => yScaleRegression(yValue(d)))
      .attr("r", 4);

    // Plot line
    cells
      .append("path")
      .attr("d", function (d) {
        return d3
          .line()
          .x((d) => xScaleRegression(xValue(d)))
          .y((d) => yScaleRegression(yValue(d)))(d[1]);
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("fill", "none");

    cells
      .append("text")
      .attr("x", cellWidth / 2)
      .attr("y", -10)
      .text(function (d) {
        return d[0];
      })
      .attr("text-anchor", "middle")
      .attr("class", "bibTitle");
  });

  //https://github.com/cmagelssen/datavis/blob/d86eeadd7aee055e6958300b1cc558aae042ba8c/random.csv

  return (
    <div id="regressionBox">
      <svg ref={regressionPlot}></svg>
    </div>
  );
};

export default Regression;
