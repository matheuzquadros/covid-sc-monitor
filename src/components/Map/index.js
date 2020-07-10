import React, { useEffect, useLayoutEffect, useState } from 'react';

import * as d3 from 'd3'
import * as topojson from "topojson-client";
import { useDispatch, useSelector } from "react-redux";
import api from '../../services/api'

import mapTopology from '../../data/map.json';
import './style.css'


export default function Map() {

  const margin = { top: 50, left: 50, right: 50, bottom: 50 };
  const [selectedCity, setSelectedCity] = useState('');

  const dispatch = useDispatch()
  const { citiesCoordinates } = useSelector(state => ({ ...state.coordinatesReducer }))

  useEffect(() => {
    api.get(`/city`)
    .then(res => {
      console.warn(citiesCoordinates)
    })  
  }, []);

  useEffect(() => {
    dispatch({
      type: "SET_CITY",
      city: selectedCity
    })

  }, [selectedCity]);


  useLayoutEffect(() => {
    function updateSize() {

      resizeMap(
        document.getElementById('map').clientWidth,
        document.getElementById('map').clientHeight
      )
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    createMap(
      document.getElementById('map').clientWidth,
      document.getElementById('map').clientHeight,
      mapTopology,
      citiesCoordinates
    )
  }, []);

  let resizeMap = (divWidth, divHeight) => {
    let width = divWidth - margin.left - margin.right;

    d3.select("g").attr("transform", "scale(" + width / 900 + ")");
  }

  var createMap = (divWidth, divHeight, data, citiesCodinates) => {

    let height = divHeight - margin.top - margin.bottom,
      width = divWidth - margin.left - margin.right;

    let svg = d3.select('#map')
      .append('svg')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.right})`);


    let projection = d3.geoMercator()
      .center([-50.80, -27.61])
      .translate([width / 2, height / 2])
      .scale(10000)

    let path = d3.geoPath()
      .projection(projection);

    let cities = topojson.feature(data, data.objects['42']).features;

    svg.selectAll('.city')
      .data(cities)
      .enter().append('path')
      .attr('class', 'city')
      .attr('d', path)
      .on('mouseover', function () {
        d3.select(this).classed('city-hovered', true)
      }).on('mouseout', function () {
        d3.select(this).classed('city-hovered', false)
      })
      .on('click', function (d) {
        let city = citiesCodinates.find(c => c.ibgeCode === d.properties.cod)
        console.log(citiesCodinates)
        setSelectedCity(city)
        let selecteds = d3.select('#map').selectAll('.city.city-selected')
        selecteds.nodes().forEach((s) => {
          d3.select(s).classed('city-selected', false)
        })
        d3.select(this).classed('city-selected', true)
      })

    /**svg.selectAll('.city-circle')
      .data(citiesCodinates)
      .enter().append("circle")
      .attr("r", 4)
      .attr("cx", function(c){
        var coords = projection([c.latLng.lng, c.latLng.lat]);
        return coords[0]
      })
      .attr("cy", function(c){
        var coords = projection([c.latLng.lng, c.latLng.lat]);
        return coords[1]
      })
      **/
  }



  return (
    <div id="map"></div>
  )
}