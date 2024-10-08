import React, { useState, useRef, useEffect, useContext } from 'react'
import '../styles/tour-details.css'
// import tourData from '../assets/data/tours'
import { Container, Row, Col, Form, ListGroup } from 'reactstrap'
import { useParams, useNavigate, Link } from 'react-router-dom'
import calculateAvgRating from '../ultis/avgRating'
import avatar from '../assets/images/avatar.jpg'
import Booking from '../components/Booking/Booking'

import { BASE_URL } from '../ultis/config'
import useFetch from '../hooks/useFetch'
import { AuthContext } from '../context/AuthContext'
import { jwtDecode } from 'jwt-decode'
const TourDetails = () => {

  const { id } = useParams()
  const reviewMsgRef = useRef('')
  const [tourRating, setTourRating] = useState(null)
  const { user } = useContext(AuthContext)
  const accessToken = localStorage.getItem('accessToken')
  let userRole = 'user'
  if (accessToken) {
    try {
      // Giải mã token JWT để lấy thông tin
      const decodedToken = jwtDecode(accessToken);
      userRole = decodedToken.role;
      console.log('User role:', userRole);
    } catch (error) {
    }
  } else {
    console.log('Access token not found');
  }
  const navigate = useNavigate()

  const { data: tour, loading, error } = useFetch(`${BASE_URL}/tours/${id}`)

  const { photo, title, desc, price, address, reviews, city, distance, maxGroupSize, userInfo } = tour

  let personCount = maxGroupSize;
  if (userInfo) {
    userInfo.map((info) => {
      console.log('User ID:', info.userId);
      console.log('Number of bookings:', info.numberbook);
      personCount -= info.numberbook;
    });
    console.log(personCount);
  }
  const { totalRating, avgRating } = calculateAvgRating(reviews)
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  const submitHandler = async e => {
    e.preventDefault()
    const reviewText = reviewMsgRef.current.value
    try {
      if (!user || user === undefined || user === null) {
        alert('Please sign in')
      }
      const reviewObj = {
        username: user?.username,
        reviewText,
        rating: tourRating
      }

      const res = await fetch(`${BASE_URL}/review/${id}`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify(reviewObj)
      })

      const result = await res.json()
      console.log(result)
      if (!res.ok) {
        return alert(result.message)
      }
      alert(result.message)

    } catch (error) {
      alert(error.message)
    }

  }
  const handleDelete = (id) => {
    const accessToken = localStorage.getItem('accessToken');
    fetch(`${BASE_URL}/tours/${id}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          alert('Bạn không có quyền xoá')
          navigate('/tours');
        }
        else {
          alert("Xoá thành công");
          navigate('/tours');
        }
        return res.json();
      })
      .then((data) => {
        if (data.deletedCount > 0) {
          fetch(`${BASE_URL}/tours/${id}`)
            .then((res) => res.json())
            .then((updatedTours) => {
              const remaining = updatedTours.filter((tour) => tour._id !== id);
              console.log(remaining);
            });
        }
      });
  };
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tour])

  return (
    <>
      <section>
        <Container>
          {loading && <h4 className='text-center pt-5'>LOADING.........</h4>}
          {error && <h4 className='text-center pt-5'>{error}</h4>}
          {
            !loading && !error &&
            <Row>
              <Col lg="8">
                <div className='tour__content'>
                  <img src={photo} alt="" />

                  <div className='tour_info'>
                    <h2>{title}</h2>

                    <div className="d-flex align-items-center gap-5">

                      <span className="tour__rating d-flex align-items-center gap-1">
                        <i class='ri-star-fill' style={{ 'color': 'var(--secondary-color)' }}></i> {avgRating === 0 ? null : avgRating}
                        {totalRating === 0 ? ('Not rated') : (<span>({reviews?.length})</span>)}
                      </span>

                      <span><i class='ri-map-pin-fill'></i> {address}</span>
                    </div>

                    <div className="tour__extra-details">
                      <span><i class='ri-map-pin-2-line'></i> {city}</span>
                      <span><i class='ri-money-dollar-circle-line'></i> {price}/ người</span>
                      <span><i class='ri-map-pin-time-line'></i> {distance} k/m</span>
                      <span> <i class='ri-group-line'></i> {maxGroupSize} người</span>
                      <span>còn lại <i class='ri-group-line'></i> {personCount} vé </span>

                    </div>

                    <h5>Đặc điểm nổi bật</h5>
                    <p>{desc}</p>
                  </div>
                  {/* ============ TOUR REVIEWS SECTION START ============ */}

                  <div className="tour__reviews mt-4">
                    <h4>Đánh giá ({reviews?.length} đánh giá)</h4>
                    {/* // set tour rating  */}
                    <Form onSubmit={submitHandler}>
                      <div className="d-flex align-items-center gap-3 mb-4 rating__group">
                        <span onClick={() => setTourRating(1)} className={tourRating >= 1 ? 'active' : 'inactive'}>1 <i className={`ri-star-s-fill ${tourRating >= 1 ? 'active' : 'inactive'}`}></i></span>
                        <span onClick={() => setTourRating(2)} className={tourRating >= 2 ? 'active' : 'inactive'}>2 <i className={`ri-star-s-fill ${tourRating >= 2 ? 'active' : 'inactive'}`}></i></span>
                        <span onClick={() => setTourRating(3)} className={tourRating >= 3 ? 'active' : 'inactive'}>3 <i className={`ri-star-s-fill ${tourRating >= 3 ? 'active' : 'inactive'}`}></i></span>
                        <span onClick={() => setTourRating(4)} className={tourRating >= 4 ? 'active' : 'inactive'}>4 <i className={`ri-star-s-fill ${tourRating >= 4 ? 'active' : 'inactive'}`}></i></span>
                        <span onClick={() => setTourRating(5)} className={tourRating >= 5 ? 'active' : 'inactive'}>5 <i className={`ri-star-s-fill ${tourRating >= 5 ? 'active' : 'inactive'}`}></i></span>
                      </div>
                      {/* set review tour  */}
                      <div className="review__input">
                        <input type="text" ref={reviewMsgRef} placeholder='chia sẻ suy nghĩ của bạn' required />
                        <button className='btn primary__btn text-white' type='submit'>
                          Gửi
                        </button>
                      </div>
                    </Form>


                    <ListGroup className='user__reviews'>
                      {
                        reviews?.map(review => (
                          <div className="review__item">
                            <img src={avatar} alt="" />

                            <div className="w-100">
                              <div className="d-flex align-items-center justify-content-between">
                                <div>
                                  <h5>{review.username}</h5>
                                  <p>{new Date(review.createdAt).toLocaleDateString('vi-VN', options)}</p>
                                </div>

                                <span className='d-flex align-items-center'>
                                  {review.rating}<i class='ri-star-s-fill'></i>
                                </span>
                              </div>

                              <h6>{review.reviewText}</h6>
                            </div>
                          </div>
                        ))
                      }
                    </ListGroup>
                  </div>
                  {/* ============ TOUR REVIEWS SECTION END ============== */}

                </div>
              </Col>

              <Col lg='4'>
                <Booking tour={tour} avgRating={avgRating} personCount={personCount} />
              </Col>
            </Row>
          }
        </Container>
        {/* xoa tour va sua tour  */}
        <Container>
          {user && userRole === 'admin' ? (
            <>
              <div className="add-tour-container ml-auto mt-4">
                <div className="user-actions">
                  <Link to={`/tours/edit/${id}`} className="update-btn">Chỉnh sửa tour</Link>
                  <button className="delete-btn" onClick={() => handleDelete(tour._id)}>Xoá tour</button>
                </div>
              </div>
            </>
          ) : (
            <div className="logged-out-message">
              { }
            </div>
          )}
        </Container>

      </section>

    </>
  )
}

export default TourDetails