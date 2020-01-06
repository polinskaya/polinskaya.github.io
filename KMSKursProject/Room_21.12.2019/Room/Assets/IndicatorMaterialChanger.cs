using Assets.Scripts.EventSystem;
using UnityEngine;

public class IndicatorMaterialChanger : MonoBehaviour
{
    [SerializeField]
    Material newmaterial;
    Material materialOfObject;

    // Use this for initialization
    void Start()
    {
        materialOfObject = GetComponent<Renderer>().material;
        EventManager.Switch += ChangeMaterial;
    }

    //смена цвета индикатора осцилографа
    private void ChangeMaterial(bool work)
    {
        GetComponent<Renderer>().material = !work ? newmaterial : materialOfObject;
    }

    // Update is called once per frame
    void Update()
    {

    }
}
