using UnityEngine;

public class Player : MonoBehaviour
{
    float MoveSpeed = 3f;//скорость передвижения
    float RotateSpeed = 10f;//скорость поворота

    public GameObject osc;
    public Transform endPosition;

    private bool move = false;
    private bool buttonPressed = false;
    protected Vector3 startPoint;
    protected Transform startLookAt;
    protected Transform starTransform;


    // Use this for initialization
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
        if (!buttonPressed && !move)
        {
            Vector3 tmpPos = transform.position + transform.TransformDirection(Vector3.back * MoveSpeed * -Input.GetAxis("Vertical"));
            //проверка выхода за границы комнаты
            if (tmpPos.y > 16 && tmpPos.y < 32 && tmpPos.x > -40 && tmpPos.x < 26)
            {
                transform.position = tmpPos;
            }
        }

        //запрет перемещения во время переключения камеры
        if (buttonPressed)
        {
            if (move)
            {
                transform.position = Vector3.Lerp(transform.position, endPosition.position, 3f * Time.deltaTime);
                transform.LookAt(osc.transform);

                if (AtPosition(transform.position, endPosition.position))
                {
                    buttonPressed = false;
                    Debug.Log("animationEnd");
                }
            }
            else
            {
                transform.position = Vector3.Lerp(transform.position, startPoint, 3f * Time.deltaTime);
                transform.LookAt(startLookAt);
                if (AtPosition(transform.position, startPoint))
                {
                    buttonPressed = false;
                    Debug.Log("animationEnd");
                }
            }
        }

    }

    private bool AtPosition(Vector3 one, Vector3 target)
    {
        return (one.x >= target.x - 0.1 && one.x <= target.x + 0.1)
               && (one.y >= target.y - 0.1 && one.y <= target.y + 0.1)
               && (one.z >= target.z - 0.1 && one.z <= target.z + 0.1);
    }
}
