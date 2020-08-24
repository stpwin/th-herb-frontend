import React from "react";
import { getDownloadUrl } from "../../utils";
import { storageConfig } from "../../config";

import {
  Container,
  Button,
  Row,
  Col,
  Card,
} from "react-bootstrap";

import "./mediaItem.css";

export const TagItem = ({
  title,
  path,
  onImageClick,
  onSubClick,
  subItems,
  prefix,
  uid,
}) => (
    <>
      <Container fluid className='mb-5'>
        <Row>
          <Col sm={5} md={10}>
            <Row>
              <Col>
                <div style={{ display: "flex" }} className='mt-1'>
                  <h4
                    data-path={path}
                    onClick={onImageClick}
                  >{`${title}`}</h4>
                </div>
              </Col>
            </Row>
            <Row>
              {subItems && subItems.map((snap, i) => {
                const data = snap.data();
                const title =
                  data.diseaseName && "โรค" + data.diseaseName;
                const description = data.description;
                // const subItems = data.recipes;
                const image = data.image
                  ? getDownloadUrl(
                    storageConfig.disease_images_path,
                    data.image
                  )
                  : `holder.js/400x400?text=ไม่มีภาพ`;
                return (
                  <Col xs={6} sm={12} md={5} lg={3} key={`disease-item-${i}`}>
                    <Card>
                      <Card.Img variant='top' src={image} />
                      <Card.Body>
                        <Card.Title>{title}</Card.Title>
                        <Card.Text className='item-content-small'>
                          {description}
                        </Card.Text>
                        <div className='list-sub-button'>
                          {data.recipes && data.recipes.length > 0
                            ? data.recipes.map((item, index) => {
                              const counter = `ที่ ${index + 1}`;
                              const name = `${prefix}${counter} ${item.recipeName}`;
                              return (
                                <Button
                                  key={`${uid}-${index}`}
                                  variant='success'
                                  className='mr-2 mb-1 custom-button'
                                  onClick={() =>
                                    onSubClick(
                                      title,
                                      name,
                                      snap,
                                      item.recipeRef,
                                      index
                                    )
                                  }
                                >
                                  {name}
                                </Button>
                              );
                            })
                            : null}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );